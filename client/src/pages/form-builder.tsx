import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Eye, Rocket, Type, List, Star, Save, GripVertical, Edit, Trash, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id?: number;
  title: string;
  type: "text" | "multiple_choice" | "rating";
  options?: string[];
  isRequired: boolean;
  orderIndex: number;
}

export default function FormBuilder() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEdit = !!params.id;

  const [form, setForm] = useState({
    title: "",
    description: "",
    isPublished: false,
  });

  const [questions, setQuestions] = useState<Question[]>([]);

  const { data: existingForm, isLoading } = useQuery({
    queryKey: ["/api/forms", params.id],
    enabled: isEdit,
  });

  const createFormMutation = useMutation({
    mutationFn: async (formData: any) => {
      const res = await apiRequest("POST", "/api/forms", formData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      setLocation(`/forms/${data.id}/edit`);
      toast({
        title: "Form created",
        description: "Your form has been created successfully.",
      });
    },
  });

  const updateFormMutation = useMutation({
    mutationFn: async (formData: any) => {
      const res = await apiRequest("PUT", `/api/forms/${params.id}`, formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      toast({
        title: "Form updated",
        description: "Your changes have been saved.",
      });
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: Question) => {
      const res = await apiRequest("POST", `/api/forms/${params.id}/questions`, questionData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forms", params.id] });
    },
  });

  useEffect(() => {
    if (existingForm) {
      setForm({
        title: existingForm.title,
        description: existingForm.description || "",
        isPublished: existingForm.isPublished,
      });
      if (existingForm.questions) {
        setQuestions(existingForm.questions);
      }
    }
  }, [existingForm]);

  const handleSaveForm = () => {
    if (isEdit) {
      updateFormMutation.mutate(form);
    } else {
      createFormMutation.mutate(form);
    }
  };

  const handlePublishForm = () => {
    const updatedForm = { ...form, isPublished: true };
    setForm(updatedForm);
    if (isEdit) {
      updateFormMutation.mutate(updatedForm);
    } else {
      createFormMutation.mutate(updatedForm);
    }
  };

  const addQuestion = (type: Question["type"]) => {
    const newQuestion: Question = {
      title: `New ${type} question`,
      type,
      isRequired: false,
      orderIndex: questions.length,
      options: type === "multiple_choice" ? ["Option 1", "Option 2"] : undefined,
    };

    if (isEdit) {
      createQuestionMutation.mutate(newQuestion);
    } else {
      setQuestions([...questions, newQuestion]);
    }
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  if (isLoading && isEdit) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold text-slate-900">Form Builder</h1>
              <Badge variant="outline" className="ml-4">
                <Save className="mr-1 h-3 w-3" />
                Auto-saving
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button onClick={handleSaveForm} disabled={createFormMutation.isPending || updateFormMutation.isPending}>
                Save Form
              </Button>
              <Button onClick={handlePublishForm} disabled={createFormMutation.isPending || updateFormMutation.isPending}>
                <Rocket className="mr-2 h-4 w-4" />
                Publish Form
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Configuration Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Form Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Form Title</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Customer Satisfaction Survey"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Help users understand the purpose of this form..."
                    rows={3}
                  />
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Add Questions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addQuestion("text")}
                    >
                      <Type className="mr-3 h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">Text Input</div>
                        <div className="text-xs text-slate-500">Short or long text answers</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addQuestion("multiple_choice")}
                    >
                      <List className="mr-3 h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">Multiple Choice</div>
                        <div className="text-xs text-slate-500">Select one option</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addQuestion("rating")}
                    >
                      <Star className="mr-3 h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">Rating Scale</div>
                        <div className="text-xs text-slate-500">1-5 scale</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {form.isPublished && (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Public URL</h3>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">Your form is available at:</div>
                      <div className="text-sm font-mono text-slate-700 break-all">
                        {window.location.origin}/f/{params.id}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form Builder Canvas */}
          <div className="lg:col-span-2">
            <Card className="min-h-[600px]">
              <CardHeader className="text-center border-b border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900">
                  {form.title || "Form Title"}
                </h1>
                <p className="text-slate-600 mt-2">
                  {form.description || "Form description will appear here"}
                </p>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {questions.map((question, index) => (
                  <Card key={index} className="group border border-slate-200 hover:border-primary transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center mb-3">
                            <Input
                              value={question.title}
                              onChange={(e) => updateQuestion(index, { title: e.target.value })}
                              className="font-medium"
                            />
                            <Badge variant="outline" className="ml-2">
                              {question.type.replace("_", " ")}
                            </Badge>
                          </div>

                          {question.type === "text" && (
                            <Input placeholder="Answer will appear here..." disabled />
                          )}

                          {question.type === "multiple_choice" && (
                            <div className="space-y-2">
                              {question.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center">
                                  <input type="radio" disabled className="mr-2" />
                                  <Input
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...(question.options || [])];
                                      newOptions[optionIndex] = e.target.value;
                                      updateQuestion(index, { options: newOptions });
                                    }}
                                    className="flex-1"
                                  />
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
                                  updateQuestion(index, { options: newOptions });
                                }}
                              >
                                <Plus className="mr-2 h-3 w-3" />
                                Add Option
                              </Button>
                            </div>
                          )}

                          {question.type === "rating" && (
                            <div className="flex items-center justify-center space-x-4">
                              <span className="text-sm text-slate-600">1</span>
                              <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((num) => (
                                  <button
                                    key={num}
                                    type="button"
                                    disabled
                                    className="w-8 h-8 border-2 border-slate-300 rounded-full text-slate-600 text-sm"
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                              <span className="text-sm text-slate-600">5</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                          <div className="cursor-move text-slate-400">
                            <GripVertical className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {questions.length === 0 && (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-500">
                    <Plus className="mx-auto h-8 w-8 mb-3" />
                    <p>Click a question type on the left to add it here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
