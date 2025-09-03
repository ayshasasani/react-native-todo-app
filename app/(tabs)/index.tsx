import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

// Define Task type
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editText, setEditText] = useState("");

  // Load tasks on start
  useEffect(() => {
    (async () => {
      const savedTasks = await AsyncStorage.getItem("tasks");
      if (savedTasks) setTasks(JSON.parse(savedTasks));
    })();
  }, []);

  // Save tasks on change
  useEffect(() => {
    AsyncStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;
    const newTask: Task = { id: Date.now().toString(), text: input.trim(), completed: false };
    setTasks([newTask, ...tasks]);
    setInput("");
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    Alert.alert("Delete Task?", "Are you sure you want to delete this task?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: () => setTasks(tasks.filter((t) => t.id !== id)) },
    ]);
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setEditText(task.text);
  };

  const saveEdit = () => {
    if (!editingTask) return;
    setTasks(
      tasks.map((t) => (t.id === editingTask.id ? { ...t, text: editText } : t))
    );
    setEditingTask(null);
    setEditText("");
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={[styles.taskCard, item.completed && styles.completedCard]}>
      <TouchableOpacity
        style={styles.taskLeft}
        onPress={() => toggleTask(item.id)}
      >
        <Ionicons
          name={item.completed ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={item.completed ? "#5FD19A" : "#5B8CFF"}
        />
        <Text style={[styles.taskText, item.completed && styles.completedText]}>
          {item.text}
        </Text>
      </TouchableOpacity>
      <View style={styles.taskButtons}>
        <TouchableOpacity onPress={() => startEdit(item)}>
          <Ionicons name="pencil" size={20} color="#FFD166" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteTask(item.id)}>
          <Ionicons name="trash" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Todo List</Text>

      {/* Add Task */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          placeholderTextColor="#888"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Task List */}
      {tasks.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-done-circle-outline" size={64} color="#5B8CFF" />
          <Text style={styles.emptyText}>No tasks yet</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Edit Modal */}
      <Modal visible={!!editingTask} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalWrap}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setEditingTask(null)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.modalInput}
              value={editText}
              onChangeText={setEditText}
              placeholder="Edit task..."
              placeholderTextColor="#888"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setEditingTask(null)} style={[styles.modalBtn, { backgroundColor: "#888" }]}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit} style={[styles.modalBtn, { backgroundColor: "#5B8CFF" }]}>
                <Text style={styles.modalBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#0B0F1A" },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 20, textAlign: "center" },
  inputRow: { flexDirection: "row", marginBottom: 20 },
  input: { flex: 1, backgroundColor: "#121826", color: "#fff", borderRadius: 12, paddingHorizontal: 16, fontSize: 16 },
  addButton: { marginLeft: 12, backgroundColor: "#5B8CFF", borderRadius: 12, padding: 10, justifyContent: "center", alignItems: "center" },
  taskCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#121826", padding: 14, borderRadius: 16, marginBottom: 12 },
  completedCard: { backgroundColor: "#1B2332" },
  taskLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  taskText: { color: "#fff", fontSize: 16 },
  completedText: { color: "#888", textDecorationLine: "line-through" },
  taskButtons: { flexDirection: "row", gap: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyText: { color: "#888", marginTop: 12, fontSize: 18 },
  modalWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#00000088" },
  modalContent: { width: "85%", backgroundColor: "#121826", padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 12 },
  modalInput: { backgroundColor: "#1B2332", borderRadius: 12, padding: 12, color: "#fff", marginBottom: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12 },
  modalBtnText: { color: "#fff", fontWeight: "600" },
});
