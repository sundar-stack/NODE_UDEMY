const toursModel = require('../model/toursModel');

exports.practiceGetAllTours = async (req, res) => {
  const queryObj = { ...req.query }; //we are destructing the query inorder to get a instance so we can keep the original query

  //FILTER THE QUERY BY REMOVING THE UNWANTED params
  const excludedFields = ['sort', 'page', 'limit', 'fields'];
  excludedFields.forEach((field) => delete queryObj[field]);

  ///filter for >= & <= values in param
  ///our query is price[lte]=2000 => we have replace lte to $lte for mongoose filtering so we have convert the param object to string
  let paramString = JSON.stringify(queryObj);
  paramString = paramString.replace(
    /\b(lte|gte|gt|lt)\b/g,
    (match) => `$${match}`
  ); 
  //   console.log(JSON.parse(paramString));

  console.log('queryOBJ>>>', req.query, 'after excluding>>>>', queryObj);
  try {
    let query = toursModel.find(JSON.parse(paramString));

    //SORTING
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      console.log(sortBy);
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    //passing only the fields that the client wants
    if (req.query.fields) {
      const showFields = req.query.fields.split(',').join(' ');
      query = query.select(showFields);
    } else {
      query = query.select('-__v');
    }

    ///PAGINATION
    ///page=2,limit=10 ; page1=> 1-10;page2=> 11-20;page=> 21-30
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);
    if(req.query.page){
        const docsLength = await toursModel.countDocuments()
        console.log(docsLength);
        if(page >= docsLength) throw new Error('NO FILES ON THE PAGE ')
    }
    // INORDER TO APPLY DIFFERENT TYPE OF FILTERS TO OUR REQUEST WE ARE TAKING THE MONGOOSE METHOD IN A NEW VARIABLE
    const docs = await query;

    res.status(200).json({
      status: 'success',
      count: docs.length,
      data: docs,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};
