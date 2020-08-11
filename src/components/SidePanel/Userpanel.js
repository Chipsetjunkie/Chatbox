import React from 'react';
import {Grid, Dropdown, Header, Icon, Modal,Input, Button, Image} from 'semantic-ui-react';
import firebase from '../Firebase';
import {connect} from 'react-redux';
import AvatarEditor from 'react-avatar-editor';

class Userpanel extends React.Component{
  state = {
    user:this.props.currentUser,
    modal:false,
    previewImage:'',
    croppedImage:'',
    blob:'',
    usersRef:firebase.database().ref('users'),
    userRef:firebase.auth().currentUser,
    storageRef:firebase.storage().ref(),
    uploadedCroppedImage:'',
    metadata:{
      contentType:'image/jpeg'
    },
    defaultdp:''
  }

  handleChange = event =>{
      const file = event.target.files[0]
      const reader = new FileReader();

      if(file){
        reader.readAsDataURL(file);
        reader.addEventListener('load', () =>{
            this.setState({previewImage:reader.result})
        })

      }

  }

  handleCropImage = () =>{
      if(this.avatarEditor){
        this.avatarEditor.getImageScaledToCanvas().toBlob(blob =>{
            let imageUrl = URL.createObjectURL(blob);
            console.log("image",imageUrl)
            this.setState({
              croppedImage:imageUrl,
              blob
            });
        })
      }
  }

  uploadCropped = () =>{
    const {storageRef,userRef, blob, metadata} = this.state
    storageRef
    .child(`avatar/users/${userRef.uid}`)
    .put(blob,metadata)
    .then(snap =>{
      snap.ref.getDownloadURL().then(url=>{
        this.setState({uploadedCroppedImage:url},() =>this.changeAvatar())
      })
    })
    .catch(err =>{
      console.log("Avatar updation gone wrong error: ", err)
    })
  }



  changeAvatar = () =>{
    this.state.userRef
    .updateProfile({
      photoURL:this.state.uploadedCroppedImage
    })
    .then(() =>{
      console.log('photourl uploaded')
    })
    .catch(err =>{
      console.log(err)
    });

    const user_obj = this.state.usersRef.child(this.state.user.uid)
    user_obj
    .update({avatar:this.state.uploadedCroppedImage})
    .then(()=>{
      console.log('updated success')
    })
    .catch(err =>{
      console.log(err)
    })
    this.closeModal()
  }

  handleSignout = () =>{
      console.log('clicked signout!!')
      firebase
      .auth()
      .signOut()
      .then(() =>{
         console.log("signed out!!")
      })
    };

    setDefaultDp=()=>{
      firebase.storage().ref().child('avatar/public/batman.png')
      .getDownloadURL()
      .then(url =>{
        this.setState({
          defaultdp:url
        })
      })
      .catch(err =>{
        console.log(err)
      })
    }


    openModal = () => this.setState({modal:true})

    closeModal = () => this.setState({modal:false})

    dropdownOptions = [
    {
        key:"user",
        text:<span>Signed is as <strong>{this.state.user.displayName}</strong></span>,
        disabled:true
    },
    {
      key:'avatar',
      text:<span onClick={this.openModal}>Change avatar</span>

    },
    {
      key:"signout",
      text:<span onClick={this.handleSignout}>Sign Out</span>
    }];


    render(){

      const {modal,user, previewImage, croppedImage, defaultdp} = this.state;
      this.setDefaultDp()
      return(
        <>
        <Grid style={{background:this.props.primaryColor}}>
            <Grid.Column>
                <Grid.Row style={{padding:"1.2em",margin:0}}>
                    <Header inverted>
                        <Icon name="code" />
                        <Header.Content>DevChat</Header.Content>
                    </Header>
              <Header style={{padding:'0.25em'}} as="h4" inverted>
                  {user.photoURL ? <Image src={user.photoURL} avatar/> : <Image src={defaultdp} avatar size='tiny'/>}
                  &nbsp;
                  <Dropdown trigger={<span>{user.displayName}</span>} options={this.dropdownOptions}/>
              </Header>
              </Grid.Row>
            </Grid.Column>
        </Grid>
        <Modal basic open={modal} onClose={this.closeModal}>
        <Modal.Content>
          <Input onChange={this.handleChange} fluid type="file" label='Image'
          name='previewImage'/>
          <Grid centered stackable columns={2}>
          <Grid.Row centered>
          <Grid.Column className="ui center aligned grid">
            {previewImage && (<AvatarEditor
              ref = {node => this.avatarEditor = node}
              image={previewImage}
              width={100}
              height={100}
              scale={1.2}/>)
            }
            </Grid.Column>
          </Grid.Row>
          </Grid>

        </Modal.Content>
        <Modal.Actions>
          {croppedImage && <Button color="green" inverted onClick={this.uploadCropped} >
          <Icon name='save'/>
            Change
          </Button> }
          <Button color="green" inverted onClick={this.handleCropImage}>
          <Icon name="image"/>
            Preview
          </Button>
          <Button color="red" inverted>
          <Icon name="remove"/>
            Cancel
          </Button>

        </Modal.Actions>
        </Modal>
        </>

      )
    }
};


const mapStateToProps = state => ({
  currentUser: state.user.currentUser
})

export default connect(mapStateToProps)(Userpanel);
