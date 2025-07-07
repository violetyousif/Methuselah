// /routes/admin/queryStats.js
// import express from 'express';
// import auth from '../../middleware/auth.js';
// import ChatLogs from '../../models/ChatLogs.js';

// const router = express.Router();

// /**
//  * Returns most common query keywords and counts from chat logs.
//  * GET /api/admin/queryStats
//  */
// router.get('/queryStats', auth('admin'), async (req, res) => {
//   try {
//     // Aggregates the most common individual words (excluding stop words)
//     // TODO: replace ChatLogs with the actual model for the chat logs
//     const result = await ChatLogs.aggregate([
//       {
//         $project: {
//           words: {
//             $split: [{ $toLower: "$message" }, " "] // split messages into lowercase words
//           }
//         }
//       },
//       { $unwind: "$words" },
//       {
//         $match: {
//           words: {
//             $nin: [
//               '', 'the', 'is', 'a', 'an', 'and', 'or', 'to', 'of', 'for', 'in', 'what', 'how', 'are', 'i', 'you'
//             ] // simple stop word filter
//           }
//         }
//       },
//       {
//         $group: {
//           _id: "$words",
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { count: -1 } },
//       { $limit: 10 } // Top 10 most common words
//     ]);

//     res.status(200).json({ topWords: result });
//   } catch (err) {
//     console.error('Error in /admin/queryStats:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;
