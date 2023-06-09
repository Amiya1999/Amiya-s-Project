const User = require('../models/user');
const Expense = require('../models/expense');

exports.getUserLeaderboard = async (req, res, next) => {
  try {
    const leaderboardOfUsers = await User.aggregate([
      {
        $lookup: {
          from: 'expenses',
          localField: '_id',
          foreignField: 'userId',
          as: 'expenses'
        }
      },
      {
        $addFields: {
          totalCost: { $sum: '$expenses.exAmount' }
        }
      },
      {
        $sort: { totalCost: -1 }
      }
    ]);

    res.status(200).json(leaderboardOfUsers);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}
