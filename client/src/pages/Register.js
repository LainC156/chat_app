import React from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link'
import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'

const REGISTER_USER = gql`
    mutation register($username: String! $email: String! $password: String! $confirmPassword: String!) {
        register(username: $username email: $email password: $password confirmPassword: $confirmPassword) {
            username email createdAt
        }
    }
`

const Register = (props) => {
  const [ variables, setVariables ] = useState({
      email: '',
      username: '',
      password: '',
      confirmPassword: ''
    })
  const [errors, setErrors ] = useState({})
  const [ registerUser, { loading }] = useMutation(REGISTER_USER, {
    update: (_, __) => props.history.push('/login'),
    onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors)
    }
  )

  const handleSubmit = (event) => {
      console.log('haciendo submit')
      console.log(variables)
      event.preventDefault()
      registerUser({ variables})
  }
  return (
    <Container style={{ color: "white" }}>
      <Typography align="center" spacing={6} m={9} style={{ padding: 20 }} variant="h5" color="primary">Register form</Typography>
      <form style={{ padding: 20 }} align="center"  onSubmit={handleSubmit} >
        <Grid  spacing={3} container  alignItems="center" justify="center" m={9}>
        <Grid item xs={12} sm={12} md={9} lg={9} xl={9} m={9}>
            <TextField fullWidth color={errors.username && 'secondary'} label={errors.username ?? "Username"} value={variables.username} onChange={e => setVariables({...variables, username: e.target.value})} type="text" name="username" variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={12} md={9} lg={9} xl={9} m={9}>
            <TextField fullWidth color={errors.email && 'secondary'} label={errors.email ?? "Email"} name="email" type="email" onChange={e => setVariables({...variables, email: e.target.value})} value={variables.email} variant="outlined" />
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
          <Grid item xs={12} sm={12} md={9} lg={9} xl={9}>
            <TextField
              fullWidth
              label={errors.confirmPassword ?? "Confirm password"}
              color={errors.confirmPassword && 'secondary'}
              name="confirmPassword"
              value={variables.confirmPassword}
              onChange={e => setVariables({...variables, confirmPassword: e.target.value})}
              type="password"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
            <Button color="secondary" fullWidth type="submit" variant="contained" disabled={loading}>
              {loading  ? 'Loading...' : 'Register'}
            </Button>
            <Link href="/login">Already have an account? Go to login</Link>
          </Grid>
        </Grid>
      </form>
    </Container>
      );
}

export default Register