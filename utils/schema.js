/**
 * @module schema
 */

/**
 * schema
 */
const schema = `
    type UserInfo {
        _id: ID
        email: String
        name: String
        lastname: String
    }
    type ProtectedUserInfo {
        _id: ID
        email: String
        name: String
        lastname: String 
        status: String
	    message: String
        accessToken: String
        accessTokenTime: String
        SSOToken: String
        refreshToken: String
    }

    type Info {
        status: String
	    message: String
    }
    input Verify{
        accessToken: String!
    }
    input SignInSSO {
        SSOToken: String!
    }
    input SignUp {
        email: String!
        name: String!
        lastname: String!
        password: String!      
    }
    input SignIn {
        email: String!
        password: String!     
    }
    input Refresh{
        refreshToken: String!
    }
    input Logout{
        accessToken: String!
    }
    type Mutation {
        verify(input: Verify): Info
        signinSSO(input: SignInSSO): ProtectedUserInfo
        signup(input: SignUp): Info
        signin(input: SignIn): ProtectedUserInfo
        refresh(input: Refresh): ProtectedUserInfo
        logout(input: Logout): Info
    }
    type Query {
       me: String
    } 
`;

module.exports = schema;
