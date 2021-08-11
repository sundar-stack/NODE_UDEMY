const fs = require('fs');

let tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
  );

exports.checkId = (req,res,next,val)=>{
    console.log(val);
    if (req.params.id * 1 > tours.length) {
        return res.status(400).json({
          status: 'FAIL',
          message: 'INVALID ID',
        });
     }

      next()
}


exports.getAllTours = (req, res) => {
    console.log(req.time);
    res.status(200).json({
      status: 'success',
      count: tours.length,
      data: { tours },
    });
  };

  exports.addTour = (req, res) => {
    const body = req.body;
  
    const itemId = tours[tours.length - 1].id + 1;
  
    const newItem = Object.assign({ id: itemId }, req.body);
  
    tours = [...tours, newItem];
  
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      (err) => {
        if (err) {
          return console.log(err);
        } else {
          res.status(200).send('success');
        }
      }
    );
  
    res.status(200).json({
      status: 'success',
      data: tours,
    });
  };
  
  exports.getTour = (req, res) => {
    const id = req.params.id * 1; //multiping number string with normal number will convert it to number
  
    const findItem = tours.find((item) => item.id === id);
    console.log(findItem);
  
    //if(id > tours.length){
    //if there is no item found
  
    if (!findItem) {
      return res.status(404).json({
        status: 'FAIL',
        message: 'INVALID ID',
      });
    }
  
    if (findItem) {
      res.status(200).json({
        status: 'success',
        data: findItem,
      });
    }
  };
  
  exports.updateTour = (req, res) => {
    //Patch will be useful only to update a specific property
  
    res.status(200).json({
      message: 'success',
      data: 'updated',
    });
  };