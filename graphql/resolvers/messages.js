const { UserInputError, AuthenticationError, withFilter, ForbiddenError  } = require('apollo-server')
const { Op } = require('sequelize')
const { Message, User, Reaction } = require('../../models')
/* query params 
    (parent, args, context, info)
    parent	This is the return value of the resolver for this field's parent (the resolver for a parent field always executes before the resolvers for that field's children).
    args	This object contains all GraphQL arguments provided for this field.
    context	This object is shared across all resolvers that execute for a particular operation. Use this to share per-operation state, such as authentication information and access to data sources.
    info	This contains information about the execution state of the operation (used only in advanced cases).
*/
module.exports = {
    Query: {
        getMessages: async(parent, {from}, { user }) => {
            try {
                if(!user) throw new AuthenticationError('Unauthenticated')

                const otherUser = await User.findOne({
                    where: { username: from }
                })
                if(!otherUser) throw new UserInputError('User not found')

                const usernames = [user.username, otherUser.username]
                const messages = await Message.findAll({
                    where: {
                        from: { [Op.in]: usernames},
                        to: { [Op.in]: usernames}
                    },
                    order: [['createdAt', 'DESC']],
                    include: [{ model: Reaction, as: 'reactions' }]
                })
                return messages
            } catch(err) {
                console.log('error: ', err)
                throw err
            }
        }
    },
    Mutation: {
        sendMessage: async(parent, {to, content}, {user, pubsub}) => {
            try {
                if(!user) throw new AuthenticationError('Unauthenticated')
                    const recipient = await User.findOne({where: {username: to}})
                console.log('recipient: ', recipient)
                console.log('user: ', user)
                if(!recipient) {
                    throw new UserInputError('user not found')
                } else if (recipient.username === user.username){
                    throw new UserInputError('You cant message yourself!')
                }
                if(content.trim() === '') {
                    throw new UserInputError('message is empty')
                }
                const message = await Message.create({
                    from: user.username,
                    to,
                    content
                })

                pubsub.publish('NEW_MESSAGE', { newMessage: message})
                return message

            } catch(err) {
                console.log('error: ', err)
                throw err
            }
        },
        reactToMessage: async(_, { uuid, content }, { user, pubsub }) => {
            const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎']
            try {
                /*  validate reaction content */
                if( !reactions.includes(content) ) {
                    throw new UserInputError('Invalid reaction')
                }
                /* get User */
                const username = user ? user.username : ''
                user= await User.findOne({ where: {username}})
                if(!user) throw new AuthenticationError('Unauthenticated')

                // Get message
                let message = await Message.findOne({ where: { uuid }})
                if(!message) throw new UserInputError('message not found')

                if(message.from !== user.username && message.to !== user.username){
                    throw new ForbiddenError('Unauthorized')
                }
                // create the reactions
                let reaction = await Reaction.findOne({
                    where: { messageId: message.id, userId: user.id}
                })
                if(reaction) {
                    //Reactions exists, updated
                    reaction.content = content
                    await reaction.save()
                } else {
                    //reaction does no exists, then is created
                    reaction = await Reaction.create({
                        messageId: message.id,
                        userId: user.id,
                        content
                    })
                }
                pubsub.publish('NEW_REACTION', {
                    newReaction: reaction
                })
                return reaction
            } catch (error) {
                throw err
            }
        }
    },
    Subscription: {
        newMessage: {
            subscribe: withFilter(
                (_, __, {  user, pubsub }) => {
                    if(!user ) throw new AuthenticationError('Unauthenticated1')
                    return pubsub.asyncIterator('NEW_MESSAGE')
                }, ({ newMessage }, _, { user }) => {
                    if(newMessage.from === user.username || newMessage.to === user.username) {
                        return true
                    }
                return false 
                }
            )
        },
        newReaction: {
            subscribe: withFilter(
                (_, __, {  user, pubsub }) => {
                    if(!user ) throw new AuthenticationError('Unauthenticated')
                    return pubsub.asyncIterator('NEW_REACTION')
                }, 
                async ({ newReaction }, _, { user }) => {
                    /* .getMessage method is created automatically by sequelize */
                    const message = await newReaction.getMessage()
                    if(message.from === user.username || message.to === user.username) {
                        return true
                    }
                return false 
                }
            )
        }
    }
}