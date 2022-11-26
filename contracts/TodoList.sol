pragma solidity ^0.5.0;

contract TodoList {
    uint public taskCount = 0;

    struct Task {
        uint id;
        string description;
        bool completed;
    }

    mapping(uint => Task) public tasks;
    address public owner;

    event TaskCreated (
        uint id,
        string description,
        bool completed
    );  

    event TaskCompleted (
        uint id,
        bool completed
    );

    event TaskDeleted (
        uint id
    );

    constructor() public {
        owner = msg.sender;
        addTask('Default task');
        addTask('Task 2');
        addTask('Task 3');
        addTask('Task 4');
    }

    function addTask (string memory _description) onlyOwner public {
        taskCount ++;
        tasks[taskCount] = Task(taskCount, _description, false);
        emit TaskCreated(taskCount, _description, false);
    }

    function toggleTask (uint _id) onlyOwner public {
        Task memory _task = tasks[_id];
        _task.completed = !_task.completed;
        tasks[_id] = _task;
        emit TaskCompleted(_id, _task.completed);
    }

    function deleteTask (uint _id) onlyOwner public {
        delete tasks[_id];
        emit TaskDeleted(_id);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner of this To-do List");
        _;
    }

}