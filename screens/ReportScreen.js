import React, {Component} from 'react';
import { Button, Platform, View, TextInput, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import { Constants, Location, Permissions } from 'expo';


export default class SettingsScreen extends Component {
  constructor(props){
    super(props)
    this.state = {
      title: '',
      description: '',
      location : null
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
          onPress={() => navigation.navigate('Map')}
          title="Submit"
          color="#007AFF"
        />
      ),
    };
  };

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  };

  render() {
    let latitude = 0;
    let longitude = 0;
    if (this.state.location) {
      latitude = this.state.location.coords.latitude;
      longitude = this.state.location.coords.longitude;
    }
    return (
      <View style={styles.container}>
        <TextInput placeholder="Title"/>
        <TextInput multiline={true} value={this.state.description} placeholder="Description"/>
        <MapView
          style={styles.map}
          region={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}>
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
    height: 20,
    width: 130,
  },
  button: {

  },
  map: {
    width: '90%',
    margin: 'auto',
    height: 400
  }
});
