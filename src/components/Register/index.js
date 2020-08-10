import React, {Component} from 'react';
import {Grid,Form,Segment,Button,Header,Message,Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../Firebase'


class Register extends Component{
    constructor(props){
        super(props)
        this.state={
            username:"",
            email:"",
            password:"",
            passwordconfirmation:"",
            error:[],
            loading:false,
            userRef:firebase.database().ref('users')
        }
    };

    componentWillUnmount() {
    console.log('unmoused userref')
    this.state.userRef.off()
  }

    Registerupdate = () =>{
      this.props.update(true)
    }

    changeHandler = e => {
          this.setState({[e.target.name]:e.target.value})
    };


    formvalid(){
        const{ username,email,password,passwordconfirmation}=this.state;
        let errors = [];
        let error;
        if (!username.length||!email.length||!password.length){
            error={message:"Please fill all the fields"}
            this.setState({error:errors.concat(error)})
            return false;
        }
        else if (password!==passwordconfirmation) {
            error={message:"Password not matching"}
            this.setState({error:errors.concat(error)});
            return false
        }
        else{
          return true
        }
    }

    saveUser = createduser =>{
      return  this.state.userRef.child(createduser.user.uid).set({
          displayName:createduser.user.displayName,
          avatar:""
        })
    }

    clickhandler = e =>{
        e.preventDefault();
        if (this.formvalid()){
          this.Registerupdate()
          this.setState({loading:true,error:[]})
          firebase
          .auth()
          .createUserWithEmailAndPassword(this.state.email,this.state.password)
          .then(user =>{
              user.user.updateProfile({
                  displayName:this.state.username,
                  avatar:''
              })
              .then(()=>{
                  this.saveUser(user).then(() =>{
                      this.setState({loading:false})
                      console.log("user saved")
                  })
              })
              .catch(err => {
                  console.log(err)
              })
            console.log(user);
            this.setState({username:"",
            email:"",
            password:"",
            passwordconfirmation:""})
          })
          .catch(err => {
            this.setState({error:[err],loading:false});
          })
        }

    };



    displayError = errors => errors.map((error,i) => <p key={i}>{error.message}</p>);

    render(){
      const{ username,email,password,passwordconfirmation,error,loading }=this.state;
      return(

        <Grid textAlign="center" verticalAlign="middle" className="RegisterForm">
          <Grid.Column style={{maxWidth:450}}>
          <Header as='h1' icon color="orange">
            <Icon name='puzzle piece' color="orange"/>
            Register
            </Header>
          <Form size="large">
            <Segment stacked>
              <Form.Input name="username" placeholder="Username" icon="user" iconPosition="left" onChange={this.changeHandler} value={username} type="text"/>
              <Form.Input name="email" placeholder="Email" icon="mail" iconPosition="left" onChange={this.changeHandler} value={email}
                 className={error.length>0?error[0].message.includes("email")?"error":"":""} type="email"/>
                 <Form.Input name="passwordconfirmation" placeholder="Re-enter Password" icon="repeat" iconPosition="left" onChange={this.changeHandler} value={passwordconfirmation}
                  className={error.length>0?error[0].message.includes("Password")?"error":"":""} type="password"/>
              <Form.Input name="password" placeholder="Password" icon="lock" iconPosition="left" onChange={this.changeHandler} value={password}
               className={error.length>0?error[0].message.includes("Password")?"error":"":""} type="password"/>
              <Button color="orange" disabled={loading} className={loading?"loading":''} fluid size="large" onClick={this.clickhandler}>Sign Up</Button>
            </Segment>
          </Form>
          <Message error className={error.length>0 ?"":"ui hidden message"}><h3>Error</h3>{this.displayError(error)}</Message>
          <Message>Already a user? <Link to="/login">Login</Link></Message>
          </Grid.Column>
        </Grid>

      )
    };
};

export default Register;
