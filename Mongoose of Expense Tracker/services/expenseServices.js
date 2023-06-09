const getExpenses = (req, where) => {
    return req.user.getExpenses(where);
}
//where has some conditions
module.exports = {
    getExpenses
}