const express         = require('express')
	, graphqlHTTP     = require('express-graphql')
	, { buildSchema } = require('graphql');

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
	}
  
	type Query {
		hello: String
		
		"Retrieve the details of the message."
		getMessage(id: ID!): Message
	}

	type Mutation {
		"Create a new message."
		createMessage(input: MessageInput): Message
		
		"Update an existing message."
		updateMessage(id: ID!, input: MessageInput): Message
		
		"Delete a message."
		deleteMessage(id: ID!): Boolean
	}
`);

// If Message had any complex fields, we'd put them on this object.
class Message {
	constructor(id, {content, author}) {
		this.id      = id;
		this.content = content;
		this.author  = author;
	}
}

// Maps username to content
let fakeDatabase = {};

// The root provides a resolver function for each API endpoint
const root = {
	hello: () => {
		return 'Hello world!';
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