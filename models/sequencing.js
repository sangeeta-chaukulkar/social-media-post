const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    seq: {
        type: Number,
        required: true
    }
});

const Counter = mongoose.model('Counter', CounterSchema);

const getNextValue = async (seqName) => { 
    try{
    const updatedResult = await Counter.findByIdAndUpdate({ "_id": seqName },{ "$inc": { "seq": 1 } })
    const result= await Counter.findById({ "_id": seqName })
    if( typeof result === 'undefined' || result === null){ return 0 }
    else { return result.seq; }
        } catch (error) {
            console.log(error);
          }
            
};

const insertCounter = async (seqName) => {
    try{
        const newCounter = new Counter({ _id: seqName, seq: 1 });
        await newCounter.save().then ((data)=> { console.log(data); return data.seq})
    }
   catch (error) {
    console.log(error);
  }

}
module.exports = {
    Counter,
    getNextValue,
    insertCounter
}