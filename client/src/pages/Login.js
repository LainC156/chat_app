import React from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link'
import { useState } from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import { useAuthDispatch } from '../context/auth'
const LOGIN_USER = gql`
    query login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            username email createdAt token
        }
    }`

const Login = (props) => {

  const [ variables, setVariables ] = useState({
      username: '',
      password: '',
    })
  const [errors, setErrors ] = useState({})

  const dispatch = useAuthDispatch()

  const [ loginUser, { loading }] = useLazyQuery(LOGIN_USER, {
      onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors),
      onCompleted(data) {
          console.log('accepted credentials')
          dispatch({ type: 'LOGIN', payload: data.login})
          window.location.href = '/'
      }
  })

  const handleSubmit = (event) => {
      console.log('login submit')
      console.log('variables: ', variables)
      event.preventDefault()
      loginUser({ variables })
  }
  return (
    <Container color="secondary">
      <Typography align="center" spacing={6} m={9} style={{ padding: 20 }} variant="h5" color="primary">Login</Typography>
      <form style={{ padding: 20 }} align="center"  onSubmit={handleSubmit} >
        <Grid  spacing={3} container  alignItems="center" justify="center" m={9}>
            <Grid item xs={12} sm={12} md={9} lg={9} xl={9} m={9}>
                <TextField fullWidth color={errors.username && 'secondary'} label={errors.username ?? "Username"} value={variables.username} onChange={e => setVariables({...variables, username: e.target.value})} type="text" name="username" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={12} md={9} lg={9} xl={9}>
                <TextField
                fullWidth
                label={errors.password ?? "Password"}
                name="password"
                type="password"
                color={errors.password && 'secondary'}
                value={variables.password}
                onChange={e => setVariables({...variables, password: e.target.value})}
                variant="outlined"
                />
            </Grid>
            <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                <Button color="secondary" fullWidth type="submit" variant="contained" disabled={loading}>
                {loading  ? 'Loading...' : 'Login'}
                </Button>
                <Link align="right" href="/register">Don't have account? Go to register</Link>
            </Grid>
        </Grid>
      </form>
    </Container>
      );
}

export default Login