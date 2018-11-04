//function secure(input){
    var letters = /[^0-9]+$/;
//}
word = "5+3";
che = letters.test(word);
console.log(che);
var res = 'Unexpected character! please check your input'
if(che)
    var res = eval(word);
console.log(res);

// module.exports.run = async (client, message, mess_args) => {

// }

// module.exports.help = {
//     name: "MATH",
//     description: "reduces math equations"
// }
module.exports.run = (client, message, args) => {
	if (!(message.author.id == "296988148792164352" || message.author.id == "329058795026382849")) {
		message.channel.send(`sorry ${message.author.username}, only Baymax and Nex can run Math.`);
	} else {
		Reg = "/[0-9]|+-\*\/(){}/";
		if (args == "") {
			message.channel.send("42");
			return;
		}
		arg_joined = args.join(" ");
		message.channel.send(RegExp.prototype.test(arg_joined));
	}
};
module.exports.help = {
	name: "MATH"
};