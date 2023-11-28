const EmailController = require('../controllers/EmailController.js');

(async ()=>{
    const result = await EmailController.enviarAvisoRecordatorioStorePickup();
if(result.err) {
    return res.status(500).json(result.message);
}
else {
    if(result.message) return res.status(200).end();
    else res.status(204).end();
}
})()