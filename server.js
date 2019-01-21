const express         = require('express')
	, graphqlHTTP     = require('express-graphql')
	, { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
let schema = buildSchema(`
	input MessageInput {
		content: String
		author: String
	}
	
	type Message {
		id: ID!
		content: String
		author: String
	}
  
	type Query {
		hello: String,
		getMessage(id: ID!): Message
	}
	
	type Mutation {
		createMessage(input: MessageInput): Message
		updateMessage(id: ID!, input: MessageInput): Message
		deleteMessage(id: ID!): Boolean
	}
`);

// If Message had any complex fields, we'd put them on this object.
class Message {
	constructor(id, {content, author}) {
		this.id = id;
		this.content = content;
		this.author = author;
	}
}

// Maps username to content
var fakeDatabase = {};

// The root provides a resolver function for each API endpoint
let root = {
	hello: () => {
		return 'Hello world!';
	},
	
	getMessage: ({id}) => {
		if ( !fakeDatabase[id] ) {
			throw new Error('no message exists with id ' + id);
		}
		
		return new Message(id, fakeDatabase[id]);
	},
	
	createMessage: ({input}) => {
		// Create a random id for our "database".
		let id = require('crypto').randomBytes(10).toString('hex');

		fakeDatabase[id] = input;
		
		return new Message(id, input);
	},
	
	updateMessage: ({id, input}) => {
		if ( !fakeDatabase[id] ) {
			throw new Error('no message exists with id ' + id);
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
			throw new Error('no message exists with id ' + id);
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