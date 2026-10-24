import express from 'express'
import db from './data/db.js'
const app = express();
const port = process.env.PORT || 3000;



app.use(express.json());

app.get('/eloadok', async (req, res) => {
	const orszagg = req.query.orszag;
	if(!orszagg){
		const getUser = 'SELECT * FROM eloadok ORDER BY nev';
		const [eredmeny]  = await db.query(getUser);
		return 	res.json(eredmeny);
	}else if(orszagg){
		const getUser2 = `SELECT * FROM eloadok WHERE orszag = ? ORDER BY nev`;
		const [eredmeny2] = await db.query(getUser2,orszagg);
		return res.json(eredmeny2);
	}

});
app.get('/eloadok/:id', async (req, res) => {
	const id = req.params.id;
	
	const commandString = 'SELECT * FROM eloadok WHERE id = ?'
	const commandString2 = 'SELECT * FROM albumok WHERE eloado_id = ? ORDER BY ev'
	const [eloadok] = await db.query(commandString,[id]);
	if(eloadok==''){
		return res.sendStatus(404)
	}
	else if(typeof(id) != Number){return res.sendStatus(400)}
	const [albumok] = await db.query(commandString2,[id]);
	res.json({eloado : eloadok[0], albumok});
})

app.get('/albumok', async (req, res) => {
	const mufajFilter = req.query.mufaj;
	const tol = req.query.tol;
	const ig = req.query.ig;

	const getUser = 'SELECT * FROM eloadok';
	const [eredmeny]  = await db.query(getUser);
	let osszes = await Promise.all(eredmeny.map(async k=>{
		const getAlbum = 'SELECT * FROM albumok WHERE eloado_id = ?';
		const [album] = await db.query(getAlbum,[k.id])
		return {...k,album : album}
	}))
	if(typeof(int) != typeof(tol)||typeof(int) != typeof(ig)||typeof(String) != typeof(mufajFilter) ){res.sendStatus(404)}
	osszes = osszes.map(k=>
		({...k,album : k.album.filter
		(l=>
			(!mufajFilter || l.mufaj === mufajFilter),
			(!tol || tol > l.ev),
			(!ig || ig < l.ev)
		)
	}))	
	osszes = osszes.filter(k=>k.album.length >0);
	res.json(osszes);
})
app.get('/albumok/kereses', async (req, res) => {
	const q = req.query.q;
	if(q.length < 2){
		return res.sendStatus(400,'legalabb 2 karakter');
	}
	const pattern = `%${q}%`;
	const [albumok] = await db.query(
		'SELECT cim FROM albumok WHERE LOWER(cim) LIKE LOWER(?)',
		[pattern]
	);
	const [eloadok] = await db.query(
		'SELECT nev FROM eloadok WHERE LOWER(nev) LIKE LOWER(?)',
		[pattern]
	);

	res.json({...eloadok,...albumok})
	
})
app.get('/statisztika/eloadok', async (req, res) => {
	const getUser = 'SELECT * FROM eloadok';
	const [eredmeny]  = await db.query(getUser);
	let osszes = await Promise.all(eredmeny.map(async k=>{
		const getAlbum = 'SELECT COUNT(id) as albumDb FROM albumok WHERE eloado_id = ?';
		const [album] = await db.query(getAlbum,[k.id])
		const getElso = `SELECT ev FROM albumok WHERE eloado_id = ? ORDER BY ev ASC LIMIT 1`
		const [elso] = await db.query(getElso,[k.id])
		const getUtolso = `SELECT ev FROM albumok WHERE eloado_id = ? ORDER BY ev DESC LIMIT 1`
		const [utolso] = await db.query(getUtolso,[k.id])
		return {nev:k.nev,albumDB : album,elso:elso,utolso:utolso}
	}))
	res.json(osszes);
})
app.get('/orszagok', async (req, res) => {
	const getUser = 'SELECT orszag,COUNT(DISTINCT eloadok.id) as eloadoDb,COUNT(albumok.id) as albumDb FROM eloadok JOIN albumok on eloadok.id = albumok.eloado_id GROUP BY orszag';
	const [valasz] = await db.query(getUser);
	res.json(valasz);
})

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
