/////mongoose save method
// const body = req.body;
  // console.log("body",body);

  // const newTourBody = new toursModel(body);
  // newTourBody.save({}, (err, docs) => {
  //   if (err) {
  //     res.status(400).json({
  //       status: 'Error',
  //       message: err,
  //     });
  //   } else {
  //     res.status(201).json({
  //       status: 'success',
  //       data: docs,
  //     });
  //   }
  // });


////////// FILTERING

// const queryObj = { ...req.query };

// console.log(req.query);

//BUILD QUERY
//exclude fileds in query params
//1.FILTERING
// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// excludedFields.forEach((value) => delete queryObj[value]);

// //1B.ADVANCE FILTERING
// //changing the param names
// //{ duration: { gte: '5' }, difficulty: 'easy' }
// let queryString = JSON.stringify(queryObj);
// queryString = queryString.replace(
//   /\b(gte|lte|gt|lt)\b/g,
//   (match) => `$${match}`
// );
// console.log(req.query.sort, JSON.parse(queryString));

//filtering methods
// const getTours = await toursModel
//   .find()
//   .where('duration')
//   .equals(5)
//   .where('difficulty')
//   .equals('easy');

// let query = toursModel.find(JSON.parse(queryString));

///2.SORTING
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(',').join(' ');
//   query = query.sort(sortBy);
//   ///THIS GIVES RESULTS IN ASCENDING ORDER BUT IF YOU WANT YOU CAN GIVE SORT=-PRICE THEN IT WILL GIVE DESCENDING ORDER
// } else {
//   query = query.sort('-createdAt'); ///- is descending order
// }

//3.LIMITING fields
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   ///we use SELECT to pass only the fields that client wants // "-" means(exclude) for not to include in the sending response data
//   query = query.select(fields);
// } else {
//   query = query.select('-__v');
// }

///paginate
//PAGE=3;LIMIT=10;PAGE1=> 1-10;PAGE2=>11-20;PAGE3=>21-30;
// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;

// ///passing page and limit to mongoose
// query = query.skip(skip).limit(limit);

// //validate
// if (req.query.page) {
//   const countDocs = await toursModel.countDocuments();
//   if (skip >= countDocs) {
//     throw new Error('Docs are empty');
//   }
// }

///execute the query
///for better chaining we have do like this


/////test