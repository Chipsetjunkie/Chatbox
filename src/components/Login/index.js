import React, {Component} from 'react';
import {Grid,Form,Segment,Button,Header,Message,Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../Firebase'


class Login extends Component{
    constructor(props){
        super(props)
        this.state={
            email:"",
            password:"",
            error:[],
            loading:false,
        }
    };


    changeHandler = event => {
        this.setState({[event.target.name]:event.target.value})
    }

    submithandler = () =>{
        this.setState({loading:true})
        firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email,this.state.password)
        .then(loggeduser =>{
            console.log(loggeduser)
            this.setState({loading:false,error:[],email:"",password:""})
        })
        .catch(err =>{
            console.log(err)
            this.setState({error:[err],loading:false})
        })
    }

    displayError = errors => errors.map((error,i) => <p key={i}>{error.message}</p>);

    render(){
        const {email,password,loading,error} = this.state
        const isValid = !email.length  || !password.length
        return(
        <Grid textAlign="center" verticalAlign="middle" className="RegisterForm">
          <Grid.Column style={{maxWidth:450}}>
          <Header as="h1" icon>
          <Icon name="code branch" color="violet"/>
          Login to Devchat
          </Header>
          <Form size="large">
            <Segment stacked>
            <Form.Input placeholder="Email" name="email"  icon="mail" onChange={this.changeHandler} iconPosition="left" type="text"/>
            <Form.Input placeholder="Password" name="password" icon="lock" iconPosition="left" onChange={this.changeHandler} type="password"/>
            <Button fluid size="large" color="violet" loading={loading} disabled={isValid||loading} onClick={this.submithandler}>Submit</Button>
            </Segment>
          </Form>
          <Message error className={error.length>0 ?"":"ui hidden message"}><h3>Error</h3>{this.displayError(error)}</Message>
          <Message>Don't have an account? <Link to="/register">Register</Link></Message>
          </Grid.Column>
        </Grid>)
};
};

export default Login;
