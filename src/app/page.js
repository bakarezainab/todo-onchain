import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button, Input, Card, CardContent } from "@/components/ui";

const contractAddress = "0xB96def98908895F6DD60D5F6556484483505da60"; // Replace with deployed contract address
const contractABI = YOUR_CONTRACT_ABI; // Replace with your ABI

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskText, setTaskText] = useState("");
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    async function loadBlockchainData() {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const taskContract = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(taskContract);
        setAccount(await signer.getAddress());
        fetchTasks(taskContract);
      } else {
        alert("Please install MetaMask");
      }
    }
    loadBlockchainData();
  }, []);

  async function fetchTasks(contract) {
    try {
      const tasks = await contract.getMyTask();
      setTasks(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  async function addTask() {
    if (!contract) return;
    try {
      const tx = await contract.addTask(taskText, taskTitle, false);
      await tx.wait();
      fetchTasks(contract);
      setTaskTitle("");
      setTaskText("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }

  async function deleteTask(taskId) {
    if (!contract) return;
    try {
      const tx = await contract.deleteTask(taskId);
      await tx.wait();
      fetchTasks(contract);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">On-Chain To-Do List</h1>
      <div className="mt-4 flex flex-col gap-2">
        <Input placeholder="Task Title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
        <Input placeholder="Task Description" value={taskText} onChange={(e) => setTaskText(e.target.value)} />
        <Button onClick={addTask}>Add Task</Button>
      </div>
      <div className="mt-6 space-y-4">
        {tasks.map((task, index) => (
          <Card key={index} className="p-4 border rounded-lg shadow-md">
            <CardContent>
              <h3 className="text-lg font-semibold">{task.taskTitle}</h3>
              <p>{task.taskText}</p>
              <Button variant="destructive" onClick={() => deleteTask(task.id)}>Delete</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
