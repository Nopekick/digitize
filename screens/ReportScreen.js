import React, {Component} from 'react';
import { Image, Text, Button, Platform, View, TextInput, StyleSheet, AsyncStorage, TouchableOpacity } from 'react-native';
import MapView, {Marker, Callout} from 'react-native-maps';
import { ImagePicker, Constants, Location, Permissions } from 'expo';

import FirebaseManager from './Firebase';

export default class ReportScreen extends Component {
  constructor(props){
    super(props)
    this.state = {
      description: '',
      latitude: 0,
      longitude: 0,
      source: ''
    }
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Create Report',
      headerLeft: (
        <Button
          onPress={() => navigation.navigate('Map')}
          title="Cancel"
          color="#007AFF"
        />
      ),
      headerRight: (
        <Button
          onPress={() => {
            let description = navigation.getParam('description')
            let {latitude, longitude} = navigation.getParam('location')
            let name = navigation.getParam('name')
            let title = navigation.getParam('title')
            let base64;
            try {
              base64 = navigation.getParam('base64') || ''
            } catch(e){
              base64 = ''
            }


            console.log("submitting")
            let db = FirebaseManager.getInstance().getDB()

            db.collection("reports").add({
                description: description,
                location: [latitude, longitude],
                date: new Date(),
                name: name,
                title: title,
                base64: base64
            })
            .then(function(docRef) {
                console.log("Document written with ID: ", docRef.id);

                FirebaseManager.getInstance().setNeedsUpdate(true)

                navigation.navigate('Map')
            })
            .catch(function(error) {
                console.error("Error adding document: ", error);
            });
          }}
          title="Submit"
          color="#007AFF"
        />
      ),
    };
  };

  async componentWillMount() {
    console.log(ImagePicker.showImagePicker)
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }

    try {
      let name = await AsyncStorage.getItem('name');
      console.log(name)
    if (name !== null) {
      this.props.navigation.setParams({name})
    }
   } catch (error) {
     this.props.navigation.setParams({name:'no name'})
   }

   const { status } = await Permissions.askAsync(Permissions.CAMERA);
   this.setState({ hasCameraPermission: status === 'granted' });
  }

  _getLocationAsync = async () => {
    let location = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
    let latitude = location.coords.latitude;
    let longitude = location.coords.longitude;
    this.setState({ latitude, longitude });
    this.props.navigation.setParams({location: {latitude, longitude}})
  };

  _takePhoto = async () => {
    const {
      status: cameraPerm
    } = await Permissions.askAsync(Permissions.CAMERA);

    const {
      status: cameraRollPerm
    } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    // only if user allows permission to camera AND camera roll
    if (cameraPerm === 'granted' && cameraRollPerm === 'granted') {
      let pickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        base64: true
      });
      console.log(pickerResult)

      this.props.navigation.setParams({base64: pickerResult.base64})
    }
  };

  render() {
    return (
      <View style={styles.container}>
      <Text style={{marginLeft: '7.5%', fontSize: 17}}>Report Information</Text>
      <TextInput placeholder="report title ie 'Dead Raccoon' "style={styles.title} onChangeText={(title) => this.props.navigation.setParams({title})}/>

        <TextInput style={styles.input} multiline={true} onChangeText={(description) => this.props.navigation.setParams({description})}
            value={this.state.description} placeholder="Description... "/>
        <Button title="Take Image (Optional)" onPress={()=> this._takePhoto()}/>
        <Text style={{marginLeft: '7.5%', fontSize: 17}}> Incident Location </Text>
        <MapView
          style={styles.map}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          }}>
          <Marker draggable
            coordinate={{latitude: this.state.latitude, longitude: this.state.longitude}}
            onDragEnd={(e) => this.props.navigation.setParams({location: e.nativeEvent.coordinate})}
            image={require('../assets/images/marker.png')}
          >
            <Callout>
            <View>
                <Text> Your Location </Text>
              </View>
              </Callout>
          </Marker>
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  input: {
    height: 100,
    width: '85%',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 4,
    marginBottom: 25,
    padding: 8
  },
  title: {
    marginTop: 10,
    height: 40,
    width: '85%',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 4,
    marginBottom: 5,
    padding: 8
  },
  map: {
    width: '85%',
    margin: 'auto',
    height: 300
  }
});


// <Camera style={{ flex: 1 }} type={Camera.Constants.Type.back}>
//     <View
//       style={{
//         flex: 1,
//         backgroundColor: 'transparent',
//         flexDirection: 'row',
//         width: 400,
//         height: 100
//       }}>
//     </View>
//   </Camera>
