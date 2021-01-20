const { UserInputError, AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')
const { User, Message } = require('../../models')

// A map of functions which return data for the schema.
module.exports = {
    Query: {
        getUsers: async (_, __, { user }) => {
            //console.log('context', context.req)
            // the third parameter is context, but only use the 'user' destructured context
            try {
                if(!user) throw new AuthenticationError('Unauthenticated')
                
                let users = await User.findAll({
                    attributes: ['username', 'imageUrl', 'createdAt'],
                    where: { username: { [Op.ne]: user.username}}
                })

                const allUserMessages = await Message.findAll({
                    where: {
                        [Op.or]: [{ from: user.username}, {to: user.username}]
                    },
                    order: [['createdAt', 'DESC']]
                })

                users = users.map((otherUser) => {
                    const lastestMessage = allUserMessages.find(
                        m => m.from === otherUser.username || m.to === otherUser.username
                    )
                    otherUser.lastestMessage = lastestMessage
                    return otherUser
                })

                return users
            } catch(err){
                console.log('error getting users: ', err)
                throw err
            }
        },
        login: async (_, args) => {
            const { username, password } = args
            let errors = {}
            //validate data
            try {
                if(username.trim() === '') errors.username = 'username must not be empty'
                if(password === '') errors.password = 'password must not be empty'
                if(Object.keys(errors).length > 0){
                    throw new UserInputError('bad input', {errors})
                }
                /// check if users exists
                const user = await User.findOne({where: {username}})

                if(!user){
                    errors.username = 'user not found'
                    throw new UserInputError('user not found', {errors})
                }
                

                const correctPassword = await bcrypt.compare(password, user.password)
                if(!correctPassword){
                    errors.password = 'password is incorrect'
                    throw new UserInputError('password is incorrect', {errors})
                }
                //jsonwebtoken
                const token = jwt.sign(
                    {username}, process.env.JWT_SECRET, { expiresIn: 60 * 60 }
                )
                user.token = token
                return { 
                    ...user.toJSON(),
                    token
                 }
            } catch(err) {
                console.log('login error', err)
                throw err
            }
        }
    },
    Mutation: {
        register: async (_, args, context, info) => {
            let { username, email, password, confirmPassword } = args
            console.log('args: ', args)
            let errors = {}
            try {
                //validate input data
                if(email.trim() === '') errors.email = 'Email must not be empty'
                if(username.trim() === '') errors.username = 'Username must not be empty'
                if(password.trim() === '') errors.password = 'Password must not be empty'
                if(confirmPassword.trim() === '') errors.confirmPassword = 'Confirm password must not be empty'
                // check if password and confirmPassword matchs
                if(password !== confirmPassword) errors.confirmPassword = 'Password and confirm password are not same'
                //TODO: check username, email exists
                //check if any field is no empty
                // const userByUsername = await User.findOne({where: { username }})
                // const userByEmail = await User.findOne({where: { email }})
                // if(userByUsername) errors.username = 'Username is taken'
                // if(userByEmail) errors.email = 'Email is taken'

                if(Object.keys(errors).length > 0){
                    throw errors
                }


                //hash password
                password = await bcrypt.hash(password, 6)
                // create user
                const user = await User.create({
                    username, email, password
                })
                //return user
                return user
            } catch(err){
                if(err.name === 'SequelizeUniqueConstraintError'){
                    err.errors.forEach( e => errors[e.path] = `${e.path} is already taken` )
                } 
                else if(err.name === 'SequelizeValidationError'){
                    err.errors.forEach( e => err.errors[e.path] = e.message )
                }
                console.log('errors en catch: ', errors)
                throw new UserInputError('Bad input to create user', { errors })
            }
        }
    }
};