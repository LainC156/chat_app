import React from 'react'
import { gql, useQuery } from '@apollo/client'
import Grid from '@material-ui/core/Grid'
import { Avatar, Typography, makeStyles } from '@material-ui/core'
import { useMessageDispatch, useMessageState } from '../../context/message'

const GET_USERS = gql`
query getUsers{
    getUsers{
        username imageUrl createdAt
        lastestMessage{
            uuid from to content createdAt
        }
    }
}`
const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    selected: {
      margin: theme.spacing(0),
      padding: '5px',
      background: '#eda56d'
    },
    noSelected: {
        margin: theme.spacing(0),
        background: '#e7e7e7',
        padding: '5px',
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

  /* {setSelectecUserConversation} is destructured from props */ 
const Users = () => {
    const classes = useStyles()
    const dispatch = useMessageDispatch()
    const [ isSelected, setIsSelected ] = React.useState()
    /* get data from context */
    const { users } = useMessageState()
    const selectedUserConversation = users?.find((u) => u.selected === true)?.username

    const { loading } = useQuery(GET_USERS, {
        onCompleted: data => dispatch({ type: 'SET_USERS', payload: data.getUsers }),
        onError: err => console.log('error getting users: ', err)
    })

    const handleSelectedUserConversation = (username) => {
        dispatch({type: 'SET_SELECTED_USER', payload: username})
        //setSelectedUserConversation(username)
        console.log('here we try to update background color')
        setIsSelected(username)
    }

    let usersMarkup 
    if(!users || loading )  {
        usersMarkup = <Typography component="p">Loading...</Typography>
    } else if( users.length === 0 ) {
        usersMarkup = <Typography component="p">No users have joined yet</Typography>
    } else if( users.length > 0 ) {
        usersMarkup = users.map((user) => {
            /*const selected = setSelectedUserConversation === user.username */
            return (
                <Grid container role="button" className={ isSelected === user.username ? classes.selected : classes.noSelected } display="flex" key={user.username} onClick={() => handleSelectedUserConversation(user.username) }>
                    <Grid item xs={5} sm={3} md={2} lg={2} xl={2}>
                        <Avatar alt="Remy Sharp" src={user.imageUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' } style={{width: 50, height:50, objectFit: 'cover'}} />
                    </Grid>
                    <Grid item xs={7} sm={9} md={10} lg={10} xl={10}>
                        <Grid container>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <Typography color="primary" component="p">{user.username}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                                <Typography noWrap  className="font-weight-light" variant="subtitle2" >{user.lastestMessage ? user.lastestMessage.content : 'You are now connected'}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            )
        })
    }
    return (
        <Grid item xs={4} sm={4} md={4} lg={4} xl={4} className={classes.conversations}>{usersMarkup}</Grid>
    )
}

export default Users

