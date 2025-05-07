
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Copy } from "lucide-react";

const InternalFormPage = () => {
  const { toast } = useToast();
  const generatedPromptRef = useRef<HTMLTextAreaElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    systemArea: '',
    currentProblem: '',
    desiredChange: '',
    expectedBenefits: '',
    
    // Dynamic fields based on system area
    dynamicFields: {
      dashboard: {
        metrics: '',
        visualElements: '',
      },
      waiterManagement: {
        waiterProcess: '',
        rankingMethod: '',
      },
      googleIntegration: {
        connectionIssue: '',
        syncFrequency: '',
        locationDetails: '',
      },
      reviewsManagement: {
        filterOptions: '',
        responseTemplates: '',
        aiAssistance: '',
      },
      paymentSystem: {
        planDetails: '',
        paymentMethod: '',
      },
      userInterface: {
        affectedPages: '',
        designPreferences: '',
      },
      reports: {
        dataNeeds: '',
        reportFormat: '',
      },
      authentication: {
        accessLevels: '',
        securityRequirements: '',
      },
    },
    
    priority: 'medium',
    deadline: '',
    references: '',
    urgency: false,
  });
  
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  
  // Handle form field changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle dynamic field changes
  const handleDynamicFieldChange = (area: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      dynamicFields: {
        ...prev.dynamicFields,
        [area]: {
          ...prev.dynamicFields[area as keyof typeof prev.dynamicFields],
          [field]: value
        }
      }
    }));
  };
  
  // Function to generate the prompt
  const generatePrompt = () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.systemArea || !formData.desiredChange) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    // Build dynamic fields section based on selected area
    let dynamicFieldsText = '';
    const area = formData.systemArea as keyof typeof formData.dynamicFields;
    
    if (area && formData.dynamicFields[area]) {
      const fields = formData.dynamicFields[area];
      
      Object.entries(fields).forEach(([key, value]) => {
        if (value) {
          const formattedKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
            
          dynamicFieldsText += `- ${formattedKey}: ${value}\n`;
        }
      });
    }
    
    // Format the prompt
    const prompt = `### Solicitação de Alteração no Sistema Target Avaliações

#### Dados do Solicitante
- Nome: ${formData.name}
- Email: ${formData.email}
- Cargo/Função: ${formData.role}
- Urgência: ${formData.urgency ? 'Sim' : 'Não'}

#### Área do Sistema
${formData.systemArea}

#### Descrição da Solicitação
**Problema Atual:**
${formData.currentProblem}

**Alteração Desejada:**
${formData.desiredChange}

**Benefícios Esperados:**
${formData.expectedBenefits}

#### Detalhes Específicos
${dynamicFieldsText}

#### Prioridade e Prazo
- Nível de prioridade: ${formData.priority}
- Prazo desejado: ${formData.deadline || 'Não especificado'}

#### Referências ou Exemplos
${formData.references || 'Nenhuma referência fornecida'}

Por favor, implementar esta solicitação conforme descrito acima.`;
    
    setGeneratedPrompt(prompt);
    setShowPrompt(true);
    
    setTimeout(() => {
      if (generatedPromptRef.current) {
        generatedPromptRef.current.focus();
        generatedPromptRef.current.select();
      }
    }, 100);
  };
  
  const copyToClipboard = () => {
    if (generatedPromptRef.current) {
      generatedPromptRef.current.select();
      document.execCommand('copy');
      
      toast({
        title: "Prompt copiado!",
        description: "O prompt foi copiado para a área de transferência.",
      });
    }
  };
  
  // Get relevant dynamic fields based on selected system area
  const getDynamicFields = () => {
    switch (formData.systemArea) {
      case 'Dashboard':
        return (
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="metrics">Métricas específicas</Label>
              <Textarea 
                id="metrics" 
                placeholder="Quais métricas você gostaria de visualizar ou alterar?"
                value={(formData.dynamicFields.dashboard.metrics || '')}
                onChange={(e) => handleDynamicFieldChange('dashboard', 'metrics', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visualElements">Elementos visuais</Label>
              <Textarea 
                id="visualElements" 
                placeholder="Descreva os gráficos, cards ou elementos visuais que você gostaria de adicionar/modificar"
                value={(formData.dynamicFields.dashboard.visualElements || '')}
                onChange={(e) => handleDynamicFieldChange('dashboard', 'visualElements', e.target.value)}
              />
            </div>
          </div>
        );
        
      case 'Gerenciamento de Garçons':
        return (
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="waiterProcess">Processo de cadastro/gestão</Label>
              <Textarea 
                id="waiterProcess" 
                placeholder="Descreva mudanças no processo de cadastro ou gestão de garçons"
                value={(formData.dynamicFields.waiterManagement.waiterProcess || '')}
                onChange={(e) => handleDynamicFieldChange('waiterManagement', 'waiterProcess', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="rankingMethod">Método de ranking</Label>
              <Textarea 
                id="rankingMethod" 
                placeholder="Descreva alterações no método de ranking ou premiação dos garçons"
                value={(formData.dynamicFields.waiterManagement.rankingMethod || '')}
                onChange={(e) => handleDynamicFieldChange('waiterManagement', 'rankingMethod', e.target.value)}
              />
            </div>
          </div>
        );
        
      case 'Integração Google':
        return (
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="connectionIssue">Problema de conexão</Label>
              <Textarea 
                id="connectionIssue" 
                placeholder="Descreva problemas de conexão com o Google"
                value={(formData.dynamicFields.googleIntegration.connectionIssue || '')}
                onChange={(e) => handleDynamicFieldChange('googleIntegration', 'connectionIssue', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="syncFrequency">Frequência de sincronização</Label>
              <Input 
                id="syncFrequency" 
                placeholder="Ex: diária, a cada 12 horas, etc."
                value={(formData.dynamicFields.googleIntegration.syncFrequency || '')}
                onChange={(e) => handleDynamicFieldChange('googleIntegration', 'syncFrequency', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="locationDetails">Detalhes de localização</Label>
              <Textarea 
                id="locationDetails" 
                placeholder="Especifique detalhes sobre a configuração de localização do Google"
                value={(formData.dynamicFields.googleIntegration.locationDetails || '')}
                onChange={(e) => handleDynamicFieldChange('googleIntegration', 'locationDetails', e.target.value)}
              />
            </div>
          </div>
        );
        
      case 'Gestão de Avaliações':
        return (
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="filterOptions">Opções de filtro</Label>
              <Textarea 
                id="filterOptions" 
                placeholder="Descreva filtros adicionais ou modificações para avaliações"
                value={(formData.dynamicFields.reviewsManagement.filterOptions || '')}
                onChange={(e) => handleDynamicFieldChange('reviewsManagement', 'filterOptions', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="responseTemplates">Templates de resposta</Label>
              <Textarea 
                id="responseTemplates" 
                placeholder="Descreva templates ou formatos para respostas automáticas"
                value={(formData.dynamicFields.reviewsManagement.responseTemplates || '')}
                onChange={(e) => handleDynamicFieldChange('reviewsManagement', 'responseTemplates', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="aiAssistance">Assistência de IA</Label>
              <Textarea 
                id="aiAssistance" 
                placeholder="Descreva recursos de IA para responder avaliações"
                value={(formData.dynamicFields.reviewsManagement.aiAssistance || '')}
                onChange={(e) => handleDynamicFieldChange('reviewsManagement', 'aiAssistance', e.target.value)}
              />
            </div>
          </div>
        );
        
      case 'Sistema de Pagamento':
        return (
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="planDetails">Detalhes do plano</Label>
              <Textarea 
                id="planDetails" 
                placeholder="Descreva alterações nos planos oferecidos"
                value={(formData.dynamicFields.paymentSystem.planDetails || '')}
                onChange={(e) => handleDynamicFieldChange('paymentSystem', 'planDetails', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Método de pagamento</Label>
              <Textarea 
                id="paymentMethod" 
                placeholder="Descreva alterações nos métodos de pagamento"
                value={(formData.dynamicFields.paymentSystem.paymentMethod || '')}
                onChange={(e) => handleDynamicFieldChange('paymentSystem', 'paymentMethod', e.target.value)}
              />
            </div>
          </div>
        );
        
      case 'Interface do Usuário':
        return (
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="affectedPages">Páginas afetadas</Label>
              <Textarea 
                id="affectedPages" 
                placeholder="Liste as páginas que precisam ser modificadas"
                value={(formData.dynamicFields.userInterface.affectedPages || '')}
                onChange={(e) => handleDynamicFieldChange('userInterface', 'affectedPages', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="designPreferences">Preferências de design</Label>
              <Textarea 
                id="designPreferences" 
                placeholder="Descreva preferências de cores, layout, etc."
                value={(formData.dynamicFields.userInterface.designPreferences || '')}
                onChange={(e) => handleDynamicFieldChange('userInterface', 'designPreferences', e.target.value)}
              />
            </div>
          </div>
        );
        
      case 'Relatórios':
        return (
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="dataNeeds">Necessidades de dados</Label>
              <Textarea 
                id="dataNeeds" 
                placeholder="Quais dados você precisa visualizar nos relatórios?"
                value={(formData.dynamicFields.reports.dataNeeds || '')}
                onChange={(e) => handleDynamicFieldChange('reports', 'dataNeeds', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reportFormat">Formato do relatório</Label>
              <Textarea 
                id="reportFormat" 
                placeholder="Descreva o formato desejado (tabelas, gráficos, exportável, etc.)"
                value={(formData.dynamicFields.reports.reportFormat || '')}
                onChange={(e) => handleDynamicFieldChange('reports', 'reportFormat', e.target.value)}
              />
            </div>
          </div>
        );
        
      case 'Autenticação/Segurança':
        return (
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="accessLevels">Níveis de acesso</Label>
              <Textarea 
                id="accessLevels" 
                placeholder="Descreva níveis de acesso ou permissões necessárias"
                value={(formData.dynamicFields.authentication.accessLevels || '')}
                onChange={(e) => handleDynamicFieldChange('authentication', 'accessLevels', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="securityRequirements">Requisitos de segurança</Label>
              <Textarea 
                id="securityRequirements" 
                placeholder="Descreva requisitos específicos de segurança"
                value={(formData.dynamicFields.authentication.securityRequirements || '')}
                onChange={(e) => handleDynamicFieldChange('authentication', 'securityRequirements', e.target.value)}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Formulário de Solicitação de Alterações</CardTitle>
          <CardDescription>
            Preencha este formulário para solicitar alterações ou melhorias no sistema Target Avaliações
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!showPrompt ? (
            <div className="space-y-6">
              {/* Informações básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações do Solicitante</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input 
                      id="name" 
                      placeholder="Seu nome completo" 
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Seu email" 
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Cargo/Função</Label>
                    <Input 
                      id="role" 
                      placeholder="Ex: Gerente, Proprietário, etc." 
                      value={formData.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox 
                      id="urgency" 
                      checked={formData.urgency} 
                      onCheckedChange={(checked) => 
                        handleChange('urgency', checked ? 'true' : '')
                      }
                    />
                    <label
                      htmlFor="urgency"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Esta solicitação é urgente
                    </label>
                  </div>
                </div>
              </div>

              {/* Área do sistema */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Área do Sistema *</h3>
                <Select
                  value={formData.systemArea}
                  onValueChange={(value) => handleChange('systemArea', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a área do sistema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dashboard">Dashboard</SelectItem>
                    <SelectItem value="Gerenciamento de Garçons">Gerenciamento de Garçons</SelectItem>
                    <SelectItem value="Integração Google">Integração Google</SelectItem>
                    <SelectItem value="Gestão de Avaliações">Gestão de Avaliações</SelectItem>
                    <SelectItem value="Sistema de Pagamento">Sistema de Pagamento</SelectItem>
                    <SelectItem value="Interface do Usuário">Interface do Usuário</SelectItem>
                    <SelectItem value="Relatórios">Relatórios</SelectItem>
                    <SelectItem value="Autenticação/Segurança">Autenticação/Segurança</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Descrição da solicitação */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Descrição da Solicitação</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentProblem">Problema atual</Label>
                    <Textarea 
                      id="currentProblem" 
                      placeholder="Descreva o problema ou situação atual" 
                      value={formData.currentProblem}
                      onChange={(e) => handleChange('currentProblem', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="desiredChange">Alteração desejada *</Label>
                    <Textarea 
                      id="desiredChange" 
                      placeholder="Descreva detalhadamente a alteração que você deseja" 
                      value={formData.desiredChange}
                      onChange={(e) => handleChange('desiredChange', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedBenefits">Benefícios esperados</Label>
                    <Textarea 
                      id="expectedBenefits" 
                      placeholder="Quais benefícios essa alteração trará para o sistema ou usuários?" 
                      value={formData.expectedBenefits}
                      onChange={(e) => handleChange('expectedBenefits', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Campos dinâmicos baseados na área selecionada */}
              {formData.systemArea && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Detalhes Específicos para {formData.systemArea}</h3>
                  {getDynamicFields()}
                </div>
              )}

              {/* Prioridade e prazo */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Prioridade e Prazo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Nível de prioridade</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleChange('priority', value)}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="crítica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Prazo desejado</Label>
                    <Input 
                      id="deadline" 
                      placeholder="Ex: 30/06/2025 ou em 2 semanas" 
                      value={formData.deadline}
                      onChange={(e) => handleChange('deadline', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Referências */}
              <div className="space-y-2">
                <Label htmlFor="references">Referências ou exemplos</Label>
                <Textarea 
                  id="references" 
                  placeholder="Links, imagens ou descrições de sistemas similares que podem servir como referência" 
                  value={formData.references}
                  onChange={(e) => handleChange('references', e.target.value)}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Campos marcados com * são obrigatórios.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Prompt Gerado</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={copyToClipboard}
                >
                  <Copy size={16} /> Copiar
                </Button>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <Textarea 
                  ref={generatedPromptRef}
                  className="min-h-[400px] font-mono text-sm"
                  value={generatedPrompt}
                  readOnly
                />
              </div>
              
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-700" />
                <AlertDescription className="text-green-700">
                  Copie o prompt acima e cole-o no chat para enviar sua solicitação de alteração.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {!showPrompt ? (
            <div className="w-full flex justify-end">
              <Button 
                type="button"
                onClick={generatePrompt}
              >
                Gerar Prompt
              </Button>
            </div>
          ) : (
            <div className="w-full flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setShowPrompt(false)}
              >
                Voltar ao Formulário
              </Button>
              
              <Button 
                onClick={copyToClipboard}
              >
                Copiar Prompt
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default InternalFormPage;
