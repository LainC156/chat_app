import { Typography, makeStyles, AppBar, Toolbar, Button } from '@material-ui/core'
import React, { Fragment, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthDispatch, useAuthState } from '../../context/auth'
import { useMessageDispatch } from '../../context/message'

import Grid from '@material-ui/core/Grid'
import Users from './Users'
import Messages from './Messages'
import { gql, useSubscription } from '@apollo/client'

const NEW_MESSAGE = gql`
    subscription newMessage {
        newMessage {
            uuid from to content createdAt
        }
    }`
const NEW_REACTION = gql`
    subscription newReaction {
        newReaction {
            uuid content 
            message{
                uuid from to
            }
        }
    }`

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    box: {
      margin: theme.spacing(1),
    },
    chat_preview: {
        margin: theme.spacing(1),
    },
    conversations: {
        background: '#e7e7e7'
    },
    title: {
      flexGrow: 1,
    },
  }));

const Home = () => {
    const classes = useStyles()
    const authDispatch = useAuthDispatch()
    const messageDispatch = useMessageDispatch()

    const { user } = useAuthState()

    const { data: messageData, error: messageError } = useSubscription(NEW_MESSAGE)
    const { data: reactionData, error: reactionError } = useSubscription(NEW_REACTION)

    useEffect(() => {
        if(messageError) console.log('error in subscription', messageError)

        if(messageData) {
            const message = messageData.newMessage
            const otherUser = user.username === message.to ? message.from : message.to

            messageDispatch({ type: 'ADD_MESSAGE', payload: {
                username: otherUser,
                message
                }
            }, [ messageError, messageData])
        }
    })

    useEffect(() => {
        if(reactionError) console.log('error in subscription', reactionError)

        if(reactionData) {
            const reaction = reactionData.newReaction
            const otherUser = user.username === reaction.message.to ? reaction.message.from : reaction.message.to

            messageDispatch({ type: 'ADD_REACTION', payload: {
                username: otherUser,
                reaction
                }
            }, [ reactionError, reactionData])
        }
    })

    const logout = () => {
        authDispatch({ type: 'LOGOUT'})
        window.location.href = '/login'
    }
    
    /* default values for color prop: ["default","inherit","primary","secondary","transparent"] */
    /* default values for variants in button: ["contained","outlined","text"]. */
    return (
        <Fragment>
            <AppBar position="static" color="primary">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Chat app
                    </Typography>
                    <Typography variant="overline" className={classes.title}>
                        welcome {user.username}!
                    </Typography>
                    <Link to="/login">
                        <Button variant="text" color="inherit">Login</Button>
                    </Link>
                    <Link to="/register">
                        <Button variant="text" color="inherit">Register</Button>
                    </Link>
                    <Button variant="text" color="inherit" onClick={logout}>Logout</Button>
                </Toolbar>
            </AppBar>
            <Grid container >
                <Users />
                <Messages></Messages>
            </Grid>
        </Fragment>
    )
}

export default Home