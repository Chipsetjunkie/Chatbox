import React from 'react';
import {Sidebar, Menu, Divider, Button, Modal, Icon, Label} from 'semantic-ui-react';
import {SliderPicker} from 'react-color';
import firebase from '../Firebase';
import {setColors} from '../Action';
import {connect} from 'react-redux';

class ColorPanel extends React.Component{
    state = {
      modal:false,
      primary:'',
      secondary:'',
      user:this.props.currentUser,
      userRef:firebase.database().ref('users'),
      userColors:[]
    }

    openModal = () => this.setState({modal:true})

    closeModal = () => this.setState({modal:false})

    handleChangePrimary = color =>{this.setState({primary:color.hex})}

    handleChangeSecondary = color => {this.setState({secondary:color.hex})}

    handleSaveColors = () => {
        if(this.state.primary && this.state.secondary){
          this.saveColors(this.state.primary, this.state.secondary);
        }
    }

    saveColors = (primary,secondary) =>{
        this.state.userRef
        .child(`${this.state.user.uid}/colors`)
        .push()
        .update({
          primary,
          secondary
        })
        .then(()=>{
          console.log('Colors added')
          this.closeModal()
        })
    }

    componentDidMount(){
      if(this.state.user){
        this.addListener(this.state.user.uid);
      }
    }

    componentWillUnmount(){
      this.removeListener();
    }

    removeListener = () =>{
      this.state.userRef.child(`${this.state.user.uid}/colors`).off()
    }

    addListener = userId =>{
      let userColors = [];
      this.state.userRef
      .child(`${userId}/colors`)
      .on('child_added',snap =>{
        userColors.unshift(snap.val());
        this.setState({userColors})
      })
    }

    displayUserColors = colors =>
      colors.length > 0 &&
      colors.map((color,i)=>(
        <React.Fragment key={i}>
        <Divider/>
        <div className="color__container"
        onClick={() => this.props.setColors(color.primary,color.secondary)}>
        <div className="color__square" style={{background:color.secondary}}>
          <div className = "color__overlay" style={{background:color.primary}}></div>
        </div>
        </div>
        </React.Fragment>
      ))



    render(){

      const {modal,primary,secondary,userColors} = this.state

      return(
          <Sidebar
            as={Menu}
            inverted
            vertical
            visible
            width="very thin"
          >
          <Divider/>
          <Button icon="add" size='small' color="blue" onClick = {this.openModal}/>
          {this.displayUserColors(userColors)}
          <Modal basic open={modal} onClose= {this.closeModal}>
          <Modal.Header>
              Choose Color Scheme
          </Modal.Header>
          <Modal.Content>
            <Label content="Primary Color"/>
            <SliderPicker color={primary} onChange={this.handleChangePrimary}/>
            <Label content="Secondary Color"/>
            <SliderPicker color={secondary} onChange={this.handleChangeSecondary}/>
          </Modal.Content>
          <Modal.Actions>
              <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark"/>
                Select Color
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove"/>
                Cancel
              </Button>
          </Modal.Actions>
          </Modal>
          </Sidebar>
      )
    }
}

export default connect(null,{setColors})(ColorPanel);
