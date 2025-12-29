import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Clipboard, Target, ArrowLeft, CheckCircle } from 'lucide-react';
import apiService from '../../services/api';

const KanbanPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const project = location.state?.project;
  
  // Use provided project or fallback to default
  const currentProject = project || {
    title: 'Sample Project',
    tenders: [
      { id: 1, title: 'Civil Construction Work', status: 'pending', budget: '₹50,00,000' },
      { id: 2, title: 'Electrical Systems', status: 'submitted', budget: '₹30,00,000' }
    ]
  };
  
  const [kanbanTasks, setKanbanTasks] = useState<any>({
    'tender-collection': [],
    'tender-summarization': [],
    'tender-allocation': []
  });

  // Initialize Kanban tasks
  useEffect(() => {
    // Initialize Kanban tasks based on project tenders
    const initialTasks = {
      'tender-collection': currentProject.tenders?.filter((t: any) => t.status === 'pending') || [],
      'tender-summarization': currentProject.tenders?.filter((t: any) => t.status === 'submitted') || [],
      'tender-allocation': []
    };
    setKanbanTasks(initialTasks);
  }, [currentProject]);

  const kanbanColumns = [
    {
      id: 'tender-collection',
      title: 'Tender Collection',
      description: 'Gathering and collecting tender submissions',
      icon: FileText,
      color: 'bg-primary'
    },
    {
      id: 'tender-summarization',
      title: 'Tender Summarization',
      description: 'Analyzing and summarizing tender details',
      icon: Clipboard,
      color: 'bg-orange-500'
    },
    {
      id: 'tender-allocation',
      title: 'Tender Allocation',
      description: 'Final allocation and project assignment',
      icon: Target,
      color: 'bg-green-500'
    }
  ];

  const handleTaskMove = async (taskId: string, fromColumn: string, toColumn: string) => {
    try {
      // Call the API to update the submission stage
      const result = await apiService.updateSubmissionStage(taskId);
      console.log('Stage updated:', result);
      
      // Update local state after successful API call
      setKanbanTasks((prev: any) => {
        const newTasks = { ...prev };
        const taskIndex = newTasks[fromColumn].findIndex((task: any) => task.id === taskId);
        if (taskIndex > -1) {
          const [task] = newTasks[fromColumn].splice(taskIndex, 1);
          // Update task status based on column
          if (toColumn === 'tender-allocation') {
            task.status = 'allocated';
          } else if (toColumn === 'tender-summarization') {
            task.status = 'reviewing';
          }
          newTasks[toColumn].push(task);
        }
        return newTasks;
      });
      
      // Show success message
      alert(`Stage updated successfully! Old stage: ${result.old_stage}, New stage: ${result.new_stage}`);
    } catch (error: any) {
      console.error('Failed to update stage:', error);
      alert(`Failed to update stage: ${error.message || 'Unknown error'}`);
    }
  };

  const completeProject = () => {
    // Move project to ongoing projects
    alert(`Project "${currentProject.title}" has been moved to Ongoing Projects!`);
    navigate('/projects/ongoing');
  };

  const goBack = () => {
    navigate('/projects/upcoming');
  };

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentProject.title}</h1>
              <p className="text-gray-600 mt-1">Tender Management Board</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Budget:</span> {project.budget}
          </div>
        </div>
      </div>

      {/* Project Info Bar */}
      <div className="bg-primary/5 border-b border-primary/20 px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p className="text-sm text-gray-700">{project.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">Start Date: <span className="font-medium">{project.startDate}</span></span>
            <span className="text-gray-600">Status: <span className="font-medium text-primary">{project.status}</span></span>
          </div>
        </div>
      </div>
      
      {/* Kanban Board */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {kanbanColumns.map((column) => {
            const Icon = column.icon;
            const tasks = kanbanTasks[column.id] || [];
            
            return (
              <div key={column.id} className="flex flex-col h-full">
                <div className={`${column.color} text-white p-4 rounded-t-lg`}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <div>
                      <h3 className="font-semibold">{column.title}</h3>
                      <p className="text-sm opacity-90">{column.description}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-sm opacity-90">{tasks.length} items</span>
                  </div>
                </div>
                
                <div className="flex-1 bg-white border-l border-r border-b rounded-b-lg p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {tasks.map((task: any) => (
                      <div
                        key={task.id}
                        className="bg-gray-50 rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow cursor-move"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', JSON.stringify({
                            taskId: task.id,
                            fromColumn: column.id
                          }));
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'submitted' ? 'bg-green-100 text-green-800' :
                            task.status === 'reviewing' ? 'bg-orange-100 text-orange-800' :
                            task.status === 'allocated' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{task.company}</p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-primary">{task.amount}</span>
                          {task.date && (
                            <span className="text-xs text-gray-500">{task.date}</span>
                          )}
                        </div>
                        
                        {/* Move buttons */}
                        <div className="flex gap-2">
                          {column.id !== 'tender-collection' && (
                            <button
                              onClick={() => {
                                const prevColumnIndex = kanbanColumns.findIndex(col => col.id === column.id) - 1;
                                if (prevColumnIndex >= 0) {
                                  handleTaskMove(task.id, column.id, kanbanColumns[prevColumnIndex].id);
                                }
                              }}
                              className="flex-1 px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                              ← Move Back
                            </button>
                          )}
                          {column.id !== 'tender-allocation' && (
                            <button
                              onClick={() => {
                                const nextColumnIndex = kanbanColumns.findIndex(col => col.id === column.id) + 1;
                                if (nextColumnIndex < kanbanColumns.length) {
                                  handleTaskMove(task.id, column.id, kanbanColumns[nextColumnIndex].id);
                                }
                              }}
                              className="flex-1 px-2 py-1 text-xs text-white bg-primary rounded hover:bg-primary/90 transition-colors"
                            >
                              Move Forward →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {tasks.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No items in this stage</p>
                        <p className="text-xs mt-1 opacity-75">Drag items here or use move buttons</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Drop zone */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-3 mt-2 text-center text-sm text-gray-500 hover:border-primary hover:bg-primary/5 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                    handleTaskMove(data.taskId, data.fromColumn, column.id);
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="w-4 h-4" />
                    Drop items here
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Action Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Project Progress:</span> 
              {kanbanTasks['tender-allocation']?.length > 0 ? (
                <span className="text-green-600 font-medium"> Ready for project execution</span>
              ) : (
                <span className="text-orange-600 font-medium"> Tender process in progress</span>
              )}
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              {kanbanColumns.map((col, index) => (
                <div key={col.id} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    kanbanTasks[col.id]?.length > 0 ? col.color : 'bg-gray-300'
                  }`} />
                  {index < kanbanColumns.length - 1 && (
                    <div className="w-8 h-0.5 bg-gray-300 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={goBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Save & Close
            </button>
            {kanbanTasks['tender-allocation']?.length > 0 && (
              <button
                onClick={completeProject}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Complete & Move to Ongoing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanPage;