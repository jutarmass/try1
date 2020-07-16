const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const app = require('express')();

app.get('/alltrydata', (req, res) => {
  db.collection('trydata')
  .orderBy('createdAt', 'desc')
  .get()
  .then(data => {
    let alldata = [];
    data.forEach(doc => {
      //alldata.push(doc.data());
      alldata.push({
        id: doc.id,
        data: doc.data().data,
        createdAt: doc.data().createdAt
      });
    });
    return res.json(alldata);
  })
  .catch(err => {
    res.status(500).json({ errorcode: err.code, message: "something went wrong" });
    console.error(err);
  });
  // functions.logger.info("/try", { datetime: new Date().toISOString(), message: "for logging" } );
  // return res.json({ datetime: new Date().toISOString(), req_headers: req.headers });
});

app.post('/trydata', (req, res) => {
  if (req.body.data.trim() === '') {
    return res.status(400).json({ message: "Data must not be empty" });
  }

  const newdata = {
    createdAt: new Date().toISOString(),
    data: req.body.data
  }

  db.collection('trydata')
  .add(newdata)
  .then(doc => {
    const resdata = newdata;
    resdata.id = doc.id;
    return res.json(resdata);
  })
  .catch(err => {
    return res.status(500).json({ error: "something went wrong" });
    console.error(err)
  });
});

app.get('/trydata/:id', (req, res) => {
  db.doc(`/trydata/${req.params.id}`)
  .get()
  .then(doc => {
    if (!doc.exists) {
      return res.status(404).json({ message: "id not found" });
    }
    res.json(doc.data());
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ errorcode: err.code, message: "something went wrong" });
  });
});

exports.api = functions.region('us-central1').https.onRequest(app);
