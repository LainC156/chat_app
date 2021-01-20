import React, { Fragment, useEffect, useState } from 'react'
import { Grid, Typography, makeStyles, Box, Paper, InputBase, IconButton } from '@material-ui/core'
import SendIcon from '@material-ui/icons/Send';
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { useMessageState, useMessageDispatch } from '../../context/message'
import Message from './Message'
const SEND_MESSAGE = gql`
    mutation sendMessage($to: String!, $content: String!) {
        sendMessage(to: $to, content: $content) {
            uuid from to content createdAt
        }
    }
    `
const GET_MESSAGES = gql`
    query getMessages($from: String!){
        getMessages(from: $from){
            uuid from to content createdAt reactions{
                uuid content
            }
        }
    }`
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        width: '100%'
    },
    message: {
        
    },
    box: {
        height: '76vh',
        display: 'flex',
        flexDirection: 'column-reverse',
        overflowY: 'scroll',
        msOverflowStyle: 'none',
        overflow: '-moz-scrollbars-none',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
        display: 'none'
        },
    },
    input: {
        flex: 1,
        borderRadius: 5,
        backgroundColor: '#e7e7e7',
        marginLeft: 5,
        padding: 5
    }
})
)
const Messages = () => {
    const classes = useStyles()
    const { users } = useMessageState()
    const dispatch = useMessageDispatch()

    const [ content, setContent] = useState('')
    const selectedUserConversation = users?.find((u) => u.selected === true)
    const messages = selectedUserConversation?.messages
    const [
        getMessages,
        { loading: messagesLoading, data: messagesData }
    ] = useLazyQuery(GET_MESSAGES)
        
    const [ sendMessage] = useMutation(SEND_MESSAGE, {
        onError: err => console.log('error sending message: ', err),
        onCompleted: () => console.log('success: ')
    })
    useEffect(() => {
        if(selectedUserConversation && !selectedUserConversation.messages){
            getMessages({ variables: {from: selectedUserConversation.username } })
        }
    }, [selectedUserConversation])

    useEffect(() => {
        if(messagesData) {
            dispatch({
                type: 'SET_USER_MESSAGES', payload: {
                username: selectedUserConversation.username,
                messages: messagesData.getMessages    
                }
            })
        }
    }, [messagesData])

    const submitMessage = e => {
        e.preventDefault()
        if(content.trim() === '' || !selectedUserConversation) return

        setContent('')

        //mutation for sending message
        sendMessage({variables: {to: selectedUserConversation.username, content}})
    }
    let selectedChatMarkup
    if(!messages && !messagesLoading) {
        selectedChatMarkup = <Box display="flex" marginBottom="auto" p={1} alignContent="flex-start"><Typography component="p">Select a friend</Typography></Box>
    } else if(messagesLoading) {
        selectedChatMarkup = <Typography component="p">Loading...</Typography>
    } else if(messages.length > 0) {
        selectedChatMarkup = messages.map((message, index) => (
                <Message key={message.uuid} message={message}></Message>
        ))
    } else if( messages.length === 0) {
        selectedChatMarkup = <Typography component="p">You are now connected! send your first message!</Typography>
    }
    return(
        <Grid className={classes.message} item xs={8} sm={8} md={8} lg={8} xl={8}>
            <Box className={classes.box} >
                { selectedChatMarkup }
            </Box>
            <Paper className={classes.root} component="form" style={{marginBottom: 3}} onSubmit={submitMessage}>
                <InputBase className={classes.input} placeholder="Type a message" id="my-input" aria-describedby="my-helper-text" value={content} onChange={e => setContent(e.target.value)} />
                <IconButton style={{marginRight: 'auto'}} type="submit" aria-label="send">
                    <SendIcon/>
                </IconButton>
            </Paper>
        </Grid>
    )

}

export default Messages 