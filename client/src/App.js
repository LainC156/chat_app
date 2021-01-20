//import logo from './logo.svg';
import ApolloProvider from './ApolloProvider'
import { BrowserRouter, Switch } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'

import './App.css';
import Register from './pages/Register'
import Home from './pages/home/Home'
import Login from './pages/Login'

import { AuthProvider } from './context/auth'
import { MessageProvider } from './context/message'
import DynamicRoute from './util/DynamicRoute'

const App = () => {
  return(
    <ApolloProvider>
      <AuthProvider>
        <MessageProvider>
          <BrowserRouter>
            <Container>
              <Typography component="div" style={{ backgroundColor: '#FFF', marginTop: '10px' }}>
                <Switch>
                  <DynamicRoute exact path="/" component={Home} authenticated/>
                  <DynamicRoute path="/register" component={Register} guest/>
                  <DynamicRoute path="/login" component={Login} guest/>
                </Switch>
              </Typography>
            </Container>
          </BrowserRouter>
        </MessageProvider>
      </AuthProvider>
    </ApolloProvider>
  )
}

export default App;
