import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TextInput, Alert, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Button, ListItem, Icon, Header } from 'react-native-elements';

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) setTasks(JSON.parse(storedTasks));
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    };
    saveTasks();
  }, [tasks]);

  const handleDeleteTask = (id) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedTasks = tasks.filter((task) => task.id !== id);
            setTasks(updatedTasks);
          },
        },
      ]
    );
  };

  const handleEditTask = (task) => {
    navigation.navigate('EditTask', { task, setTasks });
  };

  const toggleHideTasks = () => {
    setIsHidden(!isHidden);
  };

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ text: 'Task Manager', style: styles.headerText }}
        rightComponent={{
          icon: isHidden ? 'eye-off' : 'eye',
          type: 'feather',
          color: '#fff',
          onPress: toggleHideTasks,
        }}
        containerStyle={styles.header}
      />
      {!isHidden ? (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ListItem bottomDivider containerStyle={styles.listItem}>
              <ListItem.Content>
                <ListItem.Title style={styles.listTitle}>{item.text}</ListItem.Title>
              </ListItem.Content>
              <Icon
                name="edit"
                type="feather"
                color="#4caf50"
                onPress={() => handleEditTask(item)}
                containerStyle={styles.icon}
              />
              <Icon
                name="trash"
                type="feather"
                color="#ff5252"
                onPress={() => handleDeleteTask(item.id)}
                containerStyle={styles.icon}
              />
            </ListItem>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No tasks yet! 🌟</Text>}
        />
      ) : (
        <Text style={styles.hiddenText}>Tasks are hidden. 👀</Text>
      )}
      <Button
        title="Add Task"
        onPress={() => navigation.navigate('AddTask', { setTasks })}
        containerStyle={styles.buttonContainer}
        buttonStyle={styles.button}
      />
    </View>
  );
};

const AddTaskScreen = ({ navigation }) => {
  const [task, setTask] = useState('');

  const handleAddTask = async () => {
    if (task.trim()) {
      const newTask = { id: Date.now(), text: task };

      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        const currentTasks = storedTasks ? JSON.parse(storedTasks) : [];
        const updatedTasks = [...currentTasks, newTask];
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      } catch (error) {
        console.error('Error adding task:', error);
      }

      navigation.navigate('Home');
    } else {
      Alert.alert("Validation", "Task cannot be empty!");
    }
  };

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ text: 'Add New Task', style: styles.headerText }}
        containerStyle={styles.header}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter a new task"
        value={task}
        onChangeText={setTask}
      />
      <Button
        title="Add Task"
        onPress={handleAddTask}
        containerStyle={styles.buttonContainer}
        buttonStyle={styles.button}
      />
    </View>
  );
};

const EditTaskScreen = ({ route, navigation }) => {
  const { task, setTasks } = route.params;
  const [updatedTask, setUpdatedTask] = useState(task.text);

  const handleSaveEdit = async () => {
    if (updatedTask.trim()) {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        const currentTasks = storedTasks ? JSON.parse(storedTasks) : [];
        const updatedTasks = currentTasks.map((t) =>
          t.id === task.id ? { ...t, text: updatedTask } : t
        );
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
        setTasks(updatedTasks);
        navigation.navigate('Home');
      } catch (error) {
        console.error('Error saving edit:', error);
      }
    } else {
      Alert.alert("Validation", "Task cannot be empty!");
    }
  };

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ text: 'Edit Task', style: styles.headerText }}
        containerStyle={styles.header}
      />
      <TextInput
        style={styles.input}
        value={updatedTask}
        onChangeText={setUpdatedTask}
      />
      <Button
        title="Save Changes"
        onPress={handleSaveEdit}
        containerStyle={styles.buttonContainer}
        buttonStyle={styles.button}
      />
    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddTask" component={AddTaskScreen} />
        <Stack.Screen name="EditTask" component={EditTaskScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e3f2fd',
  },
  header: {
    backgroundColor: '#0288d1',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#64b5f6',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#0288d1',
  },
  listItem: {
    backgroundColor: '#b3e5fc',
    borderRadius: 10,
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  listTitle: {
    color: '#004d40',
    fontSize: 18,
  },
  icon: {
    marginHorizontal: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#00796b',
    fontSize: 16,
    marginTop: 20,
  },
  hiddenText: {
    textAlign: 'center',
    color: '#0288d1',
    fontSize: 16,
    marginTop: 20,
  },
});
