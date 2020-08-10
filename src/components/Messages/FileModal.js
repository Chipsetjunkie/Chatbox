import React from 'react';
import mime from 'mime-types';
import {Modal, Input, Button, Icon} from 'semantic-ui-react';


class FileModal extends React.Component{
      state = {
          file:null,
          authorized:['image/jpeg','image/png']
      }

      addFile = event =>{
          const file = event.target.files[0];
          if(file){
             this.setState({file:file});
          }
        }


      sendFile = () =>{
         const {file} = this.state;
         const {uploadFile,closeModal} = this.props
         if (file !== null)
         {
            if(this.isAuthorized(file.name)){
              console.log("entered")
                const metadata = {contenttype: mime.lookup(file.name)};
                console.log('metadata',metadata)
                uploadFile(file,metadata);
                closeModal();
                this.clearfile();
            }
            else{
              console.log("inproper file")
            }
         }
      }

      isAuthorized = name => this.state.authorized.includes(mime.lookup(name))

      clearfile = () =>{
        this.setState({file:null})
      }

      render(){
          const {modal,closeModal} =this.props
          return(
              <Modal basic open={modal} onClose ={closeModal}>
              <Modal.Header>Select an Input File</Modal.Header>
              <Modal.Content>
                <Input
                  fluid
                  onChange = {this.addFile}
                  label="File types: jpg,png"
                  name="file"
                  type="file"
              />
              </Modal.Content>
              <Modal.Actions>
                  <Button color="green" inverted onClick = {this.sendFile}>
                      <Icon name="checkmark"/> Send
                    </Button>
                    <Button color="red" inverted onClick={closeModal}>
                        <Icon name="remove"/> Cancel
                      </Button>
              </Modal.Actions>
              </Modal>
          )
      }

}
export default FileModal
