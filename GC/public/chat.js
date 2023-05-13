const ORIGIN = window.location.origin;
const STORED_CHATS_LENGTH = 10;
let CURRENT_GROUP_ID = null;

const token = localStorage.getItem('token');
const decodedToken = parseJwt(token);
const USERNAME = decodedToken.username;
const USER_ID = decodedToken.userId;
const USER_EMAIL = decodedToken.email;

// Navbar
const usernameNav = document.getElementById('usernameNav');
// Chats
const chatList = document.getElementById('chatList');
const messageInput = document.getElementById('sendMessage');
const sendBtn = document.getElementById('sendBtn');
const uploadFileForm = document.getElementById('uploadFileForm');
// Groups
const createGroupBtn = document.getElementById('createGroupBtn');
const groupNameInput = document.getElementById('groupName');
const createGroupSubmitBtn = document.getElementById('createGroupSubmitBtn');
const closeCreateGroupFormBtn = document.getElementById('closeCreateGroupFormBtn');
const createGroupContainer = document.getElementById('createGroupContainer');
const groupsContainer = document.getElementById('groupsContainer');
const leaveGroupBtn = document.getElementById('leaveGroupBtn');
// Group members
const groupMembersContainer = document.getElementById('groupMembersContainer');
const groupMembersTableBody = document.getElementById('groupMembersTableBody');
const showGroupMembersBtn = document.getElementById('showGroupMembersBtn');
const closeGroupMembersBtn = document.getElementById('closeGroupMembersBtn');
// Request
const receivedRequestsBtn = document.getElementById('receivedRequestsBtn');
const closeReceivedRequestsBtn = document.getElementById('closeReceivedRequestsBtn');
const sendRequestContainer = document.getElementById('sendRequestContainer');
const sendRequestBtn = document.getElementById('sendRequestBtn');
const closeSendRequestFormBtn = document.getElementById('closeSendRequestFormBtn');
const sendRequestSubmitBtn = document.getElementById('sendRequestSubmitBtn');
const requestEmailInput = document.getElementById('requestEmail');
const receivedRequestsContainer = document.getElementById('receivedRequestsContainer');
const receivedRequestsOuterContainer = document.getElementById('receivedRequestsOuterContainer');
const showRequestHistoryBtn = document.getElementById('showRequestHistoryBtn');
const closeRequestHistoryBtn = document.getElementById('closeRequestHistoryBtn');
const requestHistoryContainer = document.getElementById('requestHistoryContainer');
const receivedRequestsTableBody =  document.getElementById('receivedRequestsTableBody');
const sentRequestsTableBody = document.getElementById('sentRequestsTableBody');
// Error/Success/Logout
const errorMsg = document.getElementById('errMsg');
const successMsg = document.getElementById('successMsg');
const logoutBtn = document.getElementById('logoutBtn');

//user info-1
function showUserInfoInDOM(){
    usernameNav.innerText = USERNAME.charAt(0).toUpperCase() + USERNAME.slice(1);
}

//dom loaded-2
window.addEventListener('DOMContentLoaded', () => {
    showUserInfoInDOM();
    getGroups()
    // Logout
    logoutBtn.addEventListener('click', logout);
    // Chats
    sendBtn.addEventListener('click', createChatInGroup);
    uploadFileForm.addEventListener('submit', uploadFile);
    // Groups
    createGroupBtn.addEventListener('click', () => createGroupContainer.style.display = 'block');
    closeCreateGroupFormBtn.addEventListener('click', () => createGroupContainer.style.display = 'none');
    createGroupSubmitBtn.addEventListener('click', createGroup);
    leaveGroupBtn.addEventListener('click', leaveGroup);
    // Group Members
    showGroupMembersBtn.addEventListener('click', getGroupMembers);
    closeGroupMembersBtn.addEventListener('click', () => groupMembersContainer.style.display = 'none');
    // Requests
    receivedRequestsBtn.addEventListener('click', () => {
        getPendingRequests();
        receivedRequestsOuterContainer.style.display = 'block';
    });
    closeReceivedRequestsBtn.addEventListener('click', () => receivedRequestsOuterContainer.style.display = 'none');
    sendRequestBtn.addEventListener('click', () => sendRequestContainer.style.display = 'block');
    closeSendRequestFormBtn.addEventListener('click', () => sendRequestContainer.style.display = 'none');
    sendRequestSubmitBtn.addEventListener('click', sendRequest);
    showRequestHistoryBtn.addEventListener('click', () => {
        requestHistoryContainer.style.display = 'block';
        getRequestHistory();
    });
    closeRequestHistoryBtn.addEventListener('click', () => requestHistoryContainer.style.display = 'none');
});


//groups-3
async function addGroupInDOM(group){
    try {
        const groupBtn = document.createElement('button');
        groupBtn.innerText = group.groupName;
        groupBtn.id = group.id;


        groupBtn.addEventListener('click', (e) => {
            groupMembersContainer.style.display = 'none';
            const groupBtnClicked = e.target;
            CURRENT_GROUP_ID = groupBtnClicked.id;//sets the current selected group to the button member
            const groupBtns = groupsContainer.children;//select all the child items of the container..
            for(gb of groupBtns){
                gb.classList.remove('active');
            }
            groupBtnClicked.classList.add('active');
           //setInterval(function() {
                getGroupChats(groupBtnClicked.id);
           //  }, 1000);
              
        });

        groupsContainer.appendChild(groupBtn);
    } catch(err) {
        console.error(err);
    }
}//333333



async function getGroups(){
    try {
        const res = await axios.get(`${ORIGIN}/user/groups`, { headers: {Authorization: token} });
        const groups = res.data;

        groupsContainer.innerText = '';
        groups.forEach((group) => addGroupInDOM(group));
    } catch (err) {
        let msg = "Could not fetch user's groups :(";
        if(err.response && err.response.data && err.response.data.msg){
            msg = err.response.data.msg;
        }
        showErrorInDOM(msg);
    }
}//1



async function createGroup(e) {
    e.preventDefault();
  
    try {
      if (groupNameInput.value === '') {
        showErrorInDOM('Enter group name!');
        showErrorInInputFieldInDOM(groupNameInput);
        return;
      }
  
      const group = {
        groupName: groupNameInput.value,
      };
  
      const res = await axios.post(`${ORIGIN}/user/createGroup`, group, {
        headers: { Authorization: token },
      });
  
      const newGroup = res.data;
      addGroupInDOM(newGroup);
      showSuccessInDOM('Group Created!');
      groupNameInput.value = '';
      createGroupContainer.style.display = 'none';
    } catch (err) {
      let msg = 'Could not create group :(';
      if (err.response && err.response.data && err.response.data.msg) {
        msg = err.response.data.msg;
      }
      showErrorInDOM(msg);
    }
  }//2
 

  async function leaveGroup() {
    try {
      if (!CURRENT_GROUP_ID) {
        showErrorInDOM('Please select a group!');
        return;
      }
  
      if (!confirm('Are you sure you want to leave the group ?')) {
        return;
      }
  
      const res = await axios.delete(`${ORIGIN}/group/leaveGroup?groupId=${CURRENT_GROUP_ID}`, { headers: { Authorization: token } });
      const msg = res.data.msg;
      showSuccessInDOM(msg, 5000);
      await getGroups();
      CURRENT_GROUP_ID = null;
    } catch (err) {
      let msg = 'Could not leave group :(';
      if (err.response && err.response.data && err.response.data.msg) {
        msg = err.response.data.msg;
      }
      showErrorInDOM(msg);
    }
  }//4

// Requests-4
function sendRequest(e){
    e.preventDefault();

    if(CURRENT_GROUP_ID == null){
        showErrorInDOM('Please select a group!');
        return;
    }

    if(requestEmailInput.value === ''){
        showErrorInDOM('Enter receiver email!');
        showErrorInInputFieldInDOM(requestEmailInput);
        return;
    }

    const request = {
        email: requestEmailInput.value
    };

    axios.post(`${ORIGIN}/group/generateRequest?groupId=${CURRENT_GROUP_ID}`, request, { headers: {Authorization: token} })
    .then((res) => {
        const request = res.data;
        showSuccessInDOM('Request sent!');
        requestEmailInput.value = '';
        sendRequestContainer.style.display = 'none';
    })
    .catch((err) => {
        let msg = "Could not send group request :(";
        if(err.response && err.response.data && err.response.data.msg){
            msg = err.response.data.msg;
        }
        showErrorInDOM(msg);
    });
}//1

async function confirmRequest(groupId, status, RequestDiv) {
    const confirmation = { status };

    try {
        const res = await axios.post(`${ORIGIN}/user/confirmGroupRequest?groupId=${groupId}`, confirmation, { headers: {Authorization: token} });
        const result = res.data;
        if (result.status === 'accepted') {
            showSuccessInDOM('Request accepted!');
        } else {
            showErrorInDOM('Request rejected!');
        }
        receivedRequestsContainer.removeChild(RequestDiv);
        getGroups();
    } catch (err) {
        let msg = "Could not confirm request :(";
        if (err.response && err.response.data && err.response.data.msg) {
            msg = err.response.data.msg;
        }
        showErrorInDOM(msg);
    }
}//5

function addRequestInDOM(request){
    const groupId = request.group.id;
    const groupName = request.group.groupName;
    const username = request.user.username;

    const div = document.createElement('div');
    div.innerText = `Accept the request to join the group "${groupName}" sent by user "${username}" ?`;
    div.id= groupId;
    //div.className = 'p-1';

    const acceptRequestBtn = document.createElement('button');
    acceptRequestBtn.innerText = 'Accept';
    //acceptRequestBtn.className = 'btn btn-sm btn-outline-success mx-1';
    acceptRequestBtn.addEventListener('click', () => confirmRequest(groupId, 'accepted', div));

    const rejectRequestBtn = document.createElement('button');
    rejectRequestBtn.innerText = 'Reject';
    //rejectRequestBtn.className = 'btn btn-sm btn-outline-danger mx-1';
    rejectRequestBtn.addEventListener('click', () => confirmRequest(groupId, 'rejected', div));

    div.appendChild(acceptRequestBtn);
    div.appendChild(rejectRequestBtn);
    receivedRequestsContainer.appendChild(div);
}//2

async function getPendingRequests() {
    try {
        const res = await axios.get(`${ORIGIN}/user/pendingGroupRequests`, { headers: {Authorization: token} });
        const requests = res.data;
        receivedRequestsContainer.innerText = '';
        if(requests.length === 0){
            receivedRequestsContainer.innerText = 'No received requests';
            return;
        }
        requests.forEach((request) => addRequestInDOM(request));
    } catch (err) {
        let msg = "Could not fetch group requests :(";
        if(err.response && err.response.data && err.response.data.msg){
            msg = err.response.data.msg;
        }
        showErrorInDOM(msg);
    }
}//3

function addReceivedRequestHistoryInDOM(request){
    const tr = document.createElement('tr');

    tr.innerHTML = `
        <td>${request.user.username}</td>
        <td>${request.user.email}</td>
        <td>${request.group.groupName}</td>
        <td>${request.status}</td>
        <td>${convertToDate(request.createdAt)}</td>
        <td>${convertToTime(request.createdAt)}</td>
    `;

    receivedRequestsTableBody.appendChild(tr);
}//6

function addSentRequestHistoryInDOM(request){
    const tr = document.createElement('tr');

    tr.innerHTML = `
        <td>${request.email}</td>
        <td>${request.group.groupName}</td>
        <td>${request.status}</td>
        <td>${convertToDate(request.createdAt)}</td>
        <td>${convertToTime(request.createdAt)}</td>
    `;

    sentRequestsTableBody.appendChild(tr);
}//4

async function getRequestHistory() {
    try {
        const res = await axios.get(`${ORIGIN}/user/requestHistory`, { headers: {Authorization: token} });
        const { receivedRequests, sentRequests } = res.data;

        receivedRequestsTableBody.innerText = '';

        if(receivedRequests) {
            receivedRequests.forEach((receivedRequest) => addReceivedRequestHistoryInDOM(receivedRequest));
        }

        sentRequestsTableBody.innerText = '';

        if(sentRequests) {
            sentRequests.forEach((sentRequest) => addSentRequestHistoryInDOM(sentRequest));
        }
    } catch (err) {
        console.log(err);

        let msg = "Could not fetch request history :(";

        if(err.response && err.response.data && err.response.data.msg) {
            msg = err.response.data.msg;
        }

        showErrorInDOM(msg);
    }
}//7

//group members-5
async function promoteMemberToAdmin(memberEmail) {
    const memberObj = { memberEmail };
  
    try {
      const res = await axios.post(
        `${ORIGIN}/group/admin/promoteGroupMemberToAdmin?groupId=${CURRENT_GROUP_ID}`,
        memberObj,
        { headers: { Authorization: token } }
      );
      const msg = res.data.msg;
      showSuccessInDOM(msg, 5000);
      getGroupMembers();
    } catch (err) {
      console.log(err);
      let msg = "Could not promote group member to Admin :(";
      if (err.response && err.response.data && err.response.data.msg) {
        msg = err.response.data.msg;
      }
      showErrorInDOM(msg);
    }
  }//3
  

async function removeGroupMember(memberEmail, tr) {
    try {
      const response = await axios.delete(`${ORIGIN}/group/admin/removeGroupMember?groupId=${CURRENT_GROUP_ID}&email=${memberEmail}`,
        { headers: {Authorization: token} }
      );
      const msg = response.data.msg;
      showSuccessInDOM(msg, 5000);
      groupMembersTableBody.removeChild(tr);
    } catch (err) {
      let msg = "Could not delete group member :(";
      if (err.response && err.response.data && err.response.data.msg) {
        msg = err.response.data.msg;
      }
      showErrorInDOM(msg);
    }
  }//4
  
  async function addGroupMemberInDOM(member, admins, currentUserAdmin) {
    const memberAdminCheck = admins.filter((admin) => admin.user.email === member.email);
    const memberIsAdmin = memberAdminCheck.length === 0 ? false : true;

    const tr = document.createElement('tr');
    if (member.username === USERNAME) {
        tr.classList.add('table-info');
    }

    tr.innerHTML = 
    `<td>${member.username}</td>
    <td>${member.email}</td>
    <td>${memberIsAdmin ? 'Admin' : 'Member'}</td>
    <td>
      <button >
        Admin
      </button>
      <button >
        Remove
      </button>
    </td>`;

    groupMembersTableBody.appendChild(tr);

    if (!currentUserAdmin || memberIsAdmin) {
        tr.children[3].innerText = 'None';
        return;
    }

    const promoteToAdminBtn = tr.children[3].children[0];
    promoteToAdminBtn.addEventListener('click', async (e) => {
        const tr = e.target.parentElement.parentElement;
        const memberName = tr.children[0].innerText;
        const memberEmail = tr.children[1].innerText;
        if (confirm(`Promote "${memberName}" to Admin ?`)) {
            try {
                await promoteMemberToAdmin(memberEmail);
            } catch (error) {
                console.error('Failed to promote member to admin:', error);
            }
        }
    });

    const removeMemberBtn = tr.children[3].children[1];
    removeMemberBtn.addEventListener('click', async (e) => {
        const tr = e.target.parentElement.parentElement;
        const memberName = tr.children[0].innerText;
        const memberEmail = tr.children[1].innerText;
        if (confirm(`Remove "${memberName}" from group ?`)) {
            try {
                await removeGroupMember(memberEmail, tr);
            } catch (error) {
                console.error('Failed to remove group member:', error);
            }
        }
    });
}//2


async function getGroupMembers(){
    if(!CURRENT_GROUP_ID){
        showErrorInDOM('Please select a group!');
        return;
    }

    try {
        const res = await axios.get(`${ORIGIN}/group/members?groupId=${CURRENT_GROUP_ID}`, { headers: {Authorization: token} })
        const members = res.data.members;
        const admins = res.data.admins;
        groupMembersContainer.style.display = 'block';
        groupMembersTableBody.innerText = '';
        const currentUserAdminCheck = admins.filter((admin) => admin.user.email === USER_EMAIL);
        const currentUserAdmin = currentUserAdminCheck.length === 0 ? false : true;
        members.forEach((member) => addGroupMemberInDOM(member, admins, currentUserAdmin));
    } catch(err) {
        let msg = "Could not fetch group members :(";
        if(err.response && err.response.data && err.response.data.msg){
            msg = err.response.data.msg;
        }
        showErrorInDOM(msg);
    }
}//1

//chats-6
function addChatInDOM(chat){
    const message = chat.message;
    const dateTime = chat.createdAt;
    const username = chat.user.username;
    //fetching messAGE

    const fileURL = isValidURL(message) ? message : null; 
    //check if msg is a valid url or not, then assign to fileurl

    const div = document.createElement('div');
    const div2 = document.createElement('div');
//creating element

    const sub = document.createElement('sub');
    //sub is for writting in small fonts generally, with iamgaes time stamp..
    sub.innerText = convertToTime(dateTime, 'HHMM');
    //convertToTime(dateTime,'HHMM') is basically extracting time in hour and minute format for message time.
    //sub.className = 'ms-1';


    if(USERNAME === username){
        //if only group members are only username 
        if(fileURL){
            div2.innerHTML = `<img src="${fileURL}" alt="image" width="150" height="125">`;
            //deliver image only without any username
        }else{
            div2.innerText = `${message}`;
            //deliver message without username
        }
        // div.className = 'd-flex flex-row-reverse my-1';
        // div2.className = 'rounded bg-success text-light px-2 py-1';
    }else{
        if(fileURL){
            div2.innerHTML = `<p>${username}:</p>
            <img src="${fileURL}" alt="image" width="150" height="125" class="rounded">`;
            //deliver image with username included...
        }else{
            div2.innerText = `${username}: ${message}`
            //deliver message with username
        }
        // div.className = 'd-flex flex-row my-1';
        // div2.className = 'rounded bg-secondary text-light px-2 py-1';
    }

    div2.appendChild(sub);
    div.appendChild(div2);
    chatList.appendChild(div);
    //appending to child element 
}//2


async function getGroupChats(groupId) {
    try {
      const storedChatsArr = localStorage.getItem('storedChatsArr') ? JSON.parse(localStorage.getItem('storedChatsArr')) : [];
      const oldGroupChatsObjArr = storedChatsArr.filter((oldGroupChatObj) => oldGroupChatObj.groupId === groupId);
      const oldGroupChatsObj = oldGroupChatsObjArr.length > 0 ? oldGroupChatsObjArr[0] : { groupId, chats: [] };
      if (oldGroupChatsObjArr.length === 0) {
        storedChatsArr.push(oldGroupChatsObj);
      }
      const oldGroupChats = oldGroupChatsObj.chats;
      const lastMessageId = oldGroupChats.length > 0 ? oldGroupChats[oldGroupChats.length-1].id : -1;
  
      const res = await axios.get(`${ORIGIN}/group/chats?groupId=${groupId}&lastmsgid=${lastMessageId}`, { headers: {Authorization: token} });
      const newGroupChats = res.data;
      const totalGroupChats = [...oldGroupChats, ...newGroupChats];
      const latestGroupChats = totalGroupChats.length > STORED_CHATS_LENGTH ? totalGroupChats.slice(totalGroupChats.length - STORED_CHATS_LENGTH) : totalGroupChats;
      storedChatsArr.forEach((oldGroupChatObj) => {
        if (oldGroupChatObj.groupId === groupId) {
          oldGroupChatObj.chats = latestGroupChats;
        }
      });
      localStorage.setItem('storedChatsArr', JSON.stringify(storedChatsArr));
  
      chatList.innerText = '';
      latestGroupChats.forEach((chat) => addChatInDOM(chat));
    } catch (err) {
      let msg = "Could not fetch group chats :(";
      if (err.response && err.response.data && err.response.data.msg) {
        msg = err.response.data.msg;
      }
      showErrorInDOM(msg);
    }
  }
  //444444


  async function createChatInGroup(){
    if(CURRENT_GROUP_ID == null){
        showErrorInDOM('Please select a group!');
        return;
    }

    if(messageInput.value === ''){
        showErrorInDOM('Please enter message!');
        showErrorInInputFieldInDOM(messageInput);
        return;
    }

    const chat = {
        message: messageInput.value
    };

    try {
        const res = await axios.post(`${ORIGIN}/group/addChat?groupId=${CURRENT_GROUP_ID}`,
         chat, { headers: {Authorization: token} });

        const message = res.data.message;
        const createdAt = res.data.createdAt;

        const chatObj = {
            message,
            createdAt,
            user: { username: USERNAME }
        };

        addChatInDOM(chatObj);
        messageInput.value = '';
    }
    catch (err) {
        let msg = "Could not add chat :(";
        if (err.response && err.response.data && err.response.data.msg){
            msg = err.response.data.msg;
        }
        showErrorInDOM(msg);
    }
}//3


async function uploadFile(e) {
    e.preventDefault();
  
    if (CURRENT_GROUP_ID == null) {
      showErrorInDOM('Please select a group!');
      return;
    }
  
    const formData = new FormData(uploadFileForm);
  
    try {
      const res = await axios.post(
        `${ORIGIN}/group/uploadFile?groupId=${CURRENT_GROUP_ID}`,
        formData,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      showSuccessInDOM('File uploaded successfully!');
  
      const message = res.data.message;
      const createdAt = res.data.createdAt;
  
      const chat = {
        message,
        createdAt,
        user: { username: USERNAME },
      };
  
      addChatInDOM(chat);
    } catch (err) {
      let msg = 'Could not upload file :(';
  
      if (err.response && err.response.data && err.response.data.msg) {
        msg = err.response.data.msg;
      }
  
      showErrorInDOM(msg);
    }
  }//5

// Basic
function convertToDate(dateTime){
    const dateArr = (new Date(dateTime)).toDateString().split(' ');
    return `${dateArr[2]}-${dateArr[1]}-${dateArr[3]}`; //DD-mon-YYYY
}
//done

function convertToTime(dateTime, mode='HHMMSS'){
    const timeArr = (new Date(dateTime)).toTimeString().split(' ');
    if(mode === 'HHMM'){
        const timeArr2 = timeArr[0].split(':');
        return `${timeArr2[0]}:${timeArr2[1]}`; //HH:MM
    }
    return timeArr[0]; //HH:MM:SS
}
//done

function logout(){
    if(confirm('Are you sure you want to logout ?')){
        localStorage.clear();
        window.location.href = 'login.html';
    }
}
//done

function isValidURL(str){
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
    '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
    return !!urlPattern.test(str);
}
//done

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
//done

function showSuccessInDOM(msg='Success', time=3000){
    successMsg.innerText = msg;
    setTimeout(() => successMsg.innerText = '', time);
}
//done

function showErrorInDOM(msg='Something went wrong :(', time=3000){
    errorMsg.innerText = msg;
    setTimeout(() => errorMsg.innerText = '', time);
}
//done

function showErrorInInputFieldInDOM(inputField){
    const oldBorderColor = inputField.style.borderColor;
    inputField.style.borderColor = 'red';
    setTimeout(() => inputField.style.borderColor = oldBorderColor, 3000);
}
//done



