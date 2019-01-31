const express         = require('express')
	, graphqlHTTP     = require('express-graphql')
	, { buildSchema } = require('graphql');

		
// Begin: Data for e-commerce
let categories = [
	{id: 61521, name: "livres"},
	{id: 53782, name: "musiques"},
	{id: 60427, name: "jouets"},
	{id: 78053, name: "films"}
];

let users = [
	{id: 42860, firstName: "David", lastName:"Philibert", displayName: "David P.", deliveryAddress: "43 route des tilleuls 06560 Valbonne", civility: "M."},
	{id: 06485, firstName: "Floriane", lastName:"Eustache", displayName: "Floriane E.", deliveryAddress: "52 rue de cannes 75013 Paris", civility: "Mme"},
	{id: 58670, firstName: "Lucie", lastName:"Zakady", displayName: "Lucie", deliveryAddress: "127 place berska 75015 Paris", civility: "Mme"}
];

let articles = [
	{
		id: 82956, name: "PS4 500 Go Slim", brand: "Sony", price: 293, picture: "https://images-na.ssl-images-amazon.com/images/I/61XPLuBxQ8L._SX679_.jpg", reviews: [91049,37096],
		description: "La PS4 surpuissante : plus rapide et plus puissante pour des jeux en résolution 4K.\nGagnant du prix iF Product Design Award d'or."
	}
];

let reviews = [
	{id: 91049, author:"Stephane P.", rating:5, createdAt: "2019-01-26", title:"Tres bien", comment:"Je suis content de mon achat. Bon produit. "},	
	{id: 37096, author:"Nicolas C.", rating:4, createdAt: "2019-01-12", title:"Top!", comment:"Parfait, brancher, jouer et c’est partie"}
];
// End: Data for e-commerce
	
	
// Construct a schema, using GraphQL schema language
let schema = buildSchema(`
	"""
	A type that describes the message without ID.
	"""
	input MessageInput {
		"The content of the message."
		content: String
		
		"The author of the message."
		author: String
		
		"The type of the message."
		type: messageTypesEnum
	}
	
	"""
	A type that describes the message.
	"""
	type Message {
		"The unique identifier of the message."
		id: ID!
		
		"The content of the message."
		content: String
		
		"The author of the message."
		author: String
		
		"The type of the message."
		type: messageTypesEnum
		
		"The body of the message."		
		body: String @deprecated(reason: "Field is deprecated!")
	}
	
	type User {
		id: ID!
		civility: String
		firstName: String
		lastName: String
		displayName: String		
		deliveryAddress: String
	}
	
	type Article {
		id: ID!
		name: String
		brand: String
		price: Int
		picture: String
		description: String
		reviews: [Int]
	}
	
	type Review {
		id: ID!
		author: String
		rating: Float
		title: String
		comment: String
		createdAt: String
	}
	
	type AllMessages {
		totalCount: Int
		messages: [Message]
	}
  
	type Query {
		hello: String
		
		"Get all messages."
		getAllMessages(first: Int, offset: Int): AllMessages
		
		"Retrieve the details of the message."
		getMessage(id: ID!): Message
		
		User(id: ID!): User
		
		Article(id: ID!): Article
	}

	type Mutation {
		"Create a new message."
		createMessage(input: MessageInput): Message
		
		"Update an existing message."
		updateMessage(id: ID!, input: MessageInput): Message
		
		"Delete a message."
		deleteMessage(id: ID!): Boolean
	}
	
	enum messageTypesEnum {
		SENT_BY_CUSTOMER
		SENT_BY_ORANGE
	}
`);

// If Message had any complex fields, we'd put them on this object.
class Message {
	constructor(id, {content, author, type}) {
		this.id      = id;
		this.content = content;
		this.author  = author;
		this.type    = type;
	}
}

// Maps username to content
let fakeDatabase = {};

// The root provides a resolver function for each API endpoint
const root = {
	hello: () => {
		return 'Hello world!';
	},
	
	User: ({id}) => {
		let output = {};
		
		for ( let user of users ) {
			if ( user.id == id ) {
				output = user;
			}
		}
		
		if ( !output["id"] ) {
			throw new Error(`No user exists with id '${id}'.`);
		}
		
		return output;
	},
	
	Article: ({id}) => {
		let output = {};
		
		for ( let article of articles ) {
			if ( article.id == id ) {
				output = article;
			}
		}
		
		if ( !output["id"] ) {
			throw new Error(`No article exists with id '${id}'.`);
		}
		
		return output;
	},
	
	getAllMessages: ({first, offset}) => {
		let aMessages = [];

		for ( id in fakeDatabase ) {
			let oMessage = new Message(id, fakeDatabase[id]);
			aMessages.push(oMessage);
		}
		
		if ( first !== undefined && offset !== undefined ) {
			aMessages = aMessages.slice(first, offset);
		}

		return {
			totalCount: aMessages.length,
			messages: 	aMessages
		};
	},
	
	getMessage: ({id}) => {
		if ( !fakeDatabase[id] ) {
			throw new Error(`No message exists with id '${id}'.`);
		}
		
		return new Message(id, fakeDatabase[id]);
	},
	
	createMessage: ({input}) => {
		// Create a random id for our "database".
		let id = require('crypto').randomBytes(10).toString('hex');

		if ( input.type === undefined ) {
			input.type = "SENT_BY_ORANGE";
		}
		
		fakeDatabase[id] = input;			
		
		return new Message(id, input);
	},	
	
	updateMessage: ({id, input}) => {
		if ( !fakeDatabase[id] ) {
			throw new Error(`No message exists with id '${id}'.`);
		}

		oMessage = fakeDatabase[id];
		
		if ( input.author !== undefined ) {
			oMessage.author = input.author;
		}
		
		if ( input.content !== undefined ) {
			oMessage.content = input.content;
		}
		
		// This replaces all old data, but some apps might want partial update.
		fakeDatabase[id] = oMessage;
		
		return new Message(id, oMessage);
	},
	
	deleteMessage: ({id}) => {
		if ( !fakeDatabase[id] ) {
			throw new Error(`No message exists with id '${id}'.`);
		}
		
		delete fakeDatabase[id];
	},
};

let app = express();
app.use('/graphql', graphqlHTTP({
	schema: schema,
	rootValue: root,
	graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');