import React, { useState, Fragment } from 'react'
import { Typography, makeStyles, Box, Tooltip, Popover, Button, Avatar } from '@material-ui/core'
import { useAuthState} from '../../context/auth'
import moment from 'moment'
import FaceIcon from '@material-ui/icons/Face';
import { gql, useMutation } from '@apollo/client';
const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎']
const REACT_TO_MESSAGE = gql`
        mutation reactToMessage($uuid: String! $content: String!){
            reactToMessage(uuid: $uuid content: $content) {
                uuid
            }
        }
        `

const useStyles = makeStyles((theme) => ({
        sent: {
            background: 'blue',
            padding: theme.spacing(0.6),
            margin: theme.spacing(0.5),
            color: 'dark',
            marginLeft: 'auto',
            wordBreak: 'break-word',
            display: 'flex'
        },
        receive: {
            background: '#a9a4a4',
            padding: theme.spacing(0.5),
            margin: theme.spacing(0.5),
            color: 'dark',
            marginRight: '0',
            wordBreak: 'break-word',
            display: 'flex'
        },
        typography: {
            padding: theme.spacing(0),
            borderRadius: '50%'
        },
        ml: {
            marginLeft: 'auto'
        },
        mr: {
            marginRight: 'auto'
        },
        reaction: {
            '&:hover': {
                fontSize: '200%'
            },
            paddingRight: 0,
            paddingLeft: 0,
            transition: '0.25s'
        }
    })
)
const Message = ({ message }) => {
    const { user } = useAuthState()
    const sent = message.from === user.username ? true : false
    const classes = useStyles()
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
      }
    
    const handleClose = () => {
    setAnchorEl(null)
    }

    const [reactToMessage] = useMutation(REACT_TO_MESSAGE, {
        onError: err => console.log('error react to message', err),
        onCompleted: data => {
            console.log('data react to message: ', data)
        }
    })

    const react = (reaction) => {
        reactToMessage({ variables: {uuid: message.uuid, content: reaction}})
        setAnchorEl(null)
    }

    let open = Boolean(anchorEl)
    const id = open ? 'simple-popover' : undefined

    const button =  <Typography style={{marginTop: 4}} component="div">
                        <Button aria-describedby={id} variant="text" color="primary" onClick={handleClick}>
                            <FaceIcon/>
                        </Button>
                        <Popover
                            id={id}
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                              }}
                        >
                        <Typography display="inline" component="div" className={classes.typography}>{ reactions.map((reaction) => (
                            <Button color="secondary" className={classes.reaction} key={reaction} onClick={() => react(reaction)}>
                                    {reaction}
                            </Button>
                        )) }</Typography>
                        </Popover>
                    </Typography>

    return (
        <Typography variant="overline" style={{display: 'flex'}} className={sent ? classes.ml : classes.mr}>
            {sent && button}
            <Tooltip disableFocusListener disableTouchListener transition="true" placement={sent ? 'left' : 'right'} title={moment(message.createdAt).format('MMMM DD, YYYY @ h:mm a')}>
                <Button component="span" variant="text" className={sent ? classes.sent : classes.receive}>
                            {message.reactions.length > 0 && (
                                <Typography component="div" style={{ marginBottom: 6, borderRadius: '10%', position: 'absolute', right: '-1px', bottom: '-15px', fontSize: '0.9rem', backgroundColor: '#f3ebeb'}}>
                                    {message.reactions.map((r) => r.content)} {message.reactions.length}
                                </Typography>
                            )}
                    <Typography style={{textTransform: 'none'}} variant="overline" key={message.uuid}>{ message.content }</Typography>
                </Button>
            </Tooltip>
            {!sent && button}
        </Typography>
    )
}

export default Message