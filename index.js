const express = require("express");
const app = express();
const port = 3000;
const bodyParer = require("body-parser");

const config = require("./config/key");

const { User } = require("./models/User");

//application/x-www-form-urlencoded
app.use(bodyParer.urlencoded({ extended: true }));
//application/json
app.use(bodyParer.json());

const mongoose = require("mongoose");
mongoose
	.connect(config.mongoURI, {
		// useNewUrlParser: true,
		// useUnifiedTopology: true,
		// useCreateIndex: true,
		// useFindAndModify: false,
	})
	.then(() => console.log("MongoDB Connected..."))
	.catch((err) => console.error(err));

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/register", (req, res) => {
	//회원 가입 할 때 필요한 정보들을 client에서 가져오면
	//그것들을 데이터 베이스에 넣어준다.
	const user = new User(req.body);

	user.save((err, userInfo) => {
		if (err) return res.json({ sucess: false, err });
		return res.status(200).json({
			sucess: true,
		});
	});
});

app.post("/login", (req, res) => {
	//요청된 이메일을 데이터베이스에서 있는지 찾는다.
	User.findOne({ email: req.body.email }, (err, user) => {
		if (!user) {
			return res.json({
				loginSucess: false,
				message: "제공된 이메일에 해당하는 유저가 없습니다.",
			});
		}
		//요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인.
		user.comparePassword(req.body.comparePassword, (err, isMatch) => {
			if (!isMatch)
				return res.json({
					loginSucess: false,
					message: "비밀번호가 틀렸습니다.",
				});
			//비밀번호 까지 맞다면 Token을 생성하기.
			user.generateToken((err, user) => {});
		});
	});
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}!`);
});
