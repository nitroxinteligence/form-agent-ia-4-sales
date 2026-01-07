"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  X,
} from "lucide-react";

import { supabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const FORM_DATA_KEY = "ia_four_sales_form_data";
const FORM_ID_KEY = "ia_four_sales_form_id";
const FORM_STEP_KEY = "ia_four_sales_form_step";
const FORM_STEP_TIMESTAMPS_KEY = "ia_four_sales_form_step_timestamps";

const BUCKET_NAME = "agent-knowledge";

type KnowledgeBaseFile = {
  name: string;
  size: number;
  type: string;
  path: string;
};

type KnowledgePreview = KnowledgeBaseFile & {
  id: string;
  previewUrl: string;
};

type FormValues = {
  fullName: string;
  email: string;
  agentRole: string;
  agentRoleOther: string;
  termsAccepted: boolean;
  termsAcceptedAt?: string | null;
  agentName: string;
  agentDescription: string;
  agentRules: string;
  agentTone: string;
  agentBehaviors: string;
  agentFocus: string;
  agentGoal: string;
  agentUnknownQuestions: string;
  productName: string;
  productDescription: string;
  productFeatures: string;
  productDifferentials: string;
  productAudience: string;
  shouldSell: boolean;
  salesProcess: string;
  salesObjections: string;
  salesObjectionsHandling: string;
  salesGoals: string;
  salesChannels: string;
  successCases: string;
  scripts: string;
  knowledgeBaseFiles: KnowledgeBaseFile[];
  externalSystems: string[];
  externalFeatures: string[];
  schedulingTool: string;
  schedulingAvailability: string;
  schedulingRequiredInfo: string;
  operationsPerStage: string;
  followUpRules: string;
  remindersRules: string;
  responseTime: string;
  importantLinks: string[];
  extraInfo: string;
};

type StepKey =
  | "initial"
  | "training"
  | "product"
  | "sales"
  | "personalization"
  | "integrations"
  | "scheduling"
  | "communication"
  | "links"
  | "extra"
  | "final";

type Step = {
  key: StepKey;
  title: string;
  description?: string;
  optional?: boolean;
  enabled?: boolean;
};

const defaultValues: FormValues = {
  fullName: "",
  email: "",
  agentRole: "",
  agentRoleOther: "",
  termsAccepted: false,
  termsAcceptedAt: null,
  agentName: "",
  agentDescription: "",
  agentRules: "",
  agentTone: "",
  agentBehaviors: "",
  agentFocus: "",
  agentGoal: "",
  agentUnknownQuestions: "",
  productName: "",
  productDescription: "",
  productFeatures: "",
  productDifferentials: "",
  productAudience: "",
  shouldSell: false,
  salesProcess: "",
  salesObjections: "",
  salesObjectionsHandling: "",
  salesGoals: "",
  salesChannels: "",
  successCases: "",
  scripts: "",
  knowledgeBaseFiles: [],
  externalSystems: [],
  externalFeatures: [],
  schedulingTool: "",
  schedulingAvailability: "",
  schedulingRequiredInfo: "",
  operationsPerStage: "",
  followUpRules: "",
  remindersRules: "",
  responseTime: "",
  importantLinks: [],
  extraInfo: "",
};

const roleOptions = [
  "Agente SDR",
  "Agente Vendas",
  "Agente Customer Success",
  "Agente Suporte",
  "Outro",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function ListInput({
  label,
  description,
  placeholder,
  items,
  onChange,
  onSave,
}: {
  label: string;
  description?: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
  onSave: () => void;
}) {
  const [value, setValue] = React.useState("");

  const addItem = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setValue("");
    onSave();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{label}</Label>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={value}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" variant="secondary" onClick={addItem}>
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
            >
              {item}
              <button
                type="button"
                onClick={() => {
                  onChange(items.filter((_, i) => i !== index));
                  onSave();
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SaveStatus({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;

  const content = {
    saving: {
      label: "Salvando...",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
    },
    saved: {
      label: "Salvo",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    error: {
      label: "Erro ao salvar",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    idle: { label: "", icon: null },
  }[status];

  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
      {content.icon}
      {content.label}
    </div>
  );
}

export function FormWizard() {
  const form = useForm<FormValues>({
    defaultValues,
    mode: "onBlur",
  });

  const values = form.watch();
  const [formId, setFormId] = React.useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [savingStatus, setSavingStatus] = React.useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [stepTimestamps, setStepTimestamps] = React.useState<
    Record<string, string>
  >({});
  const [knowledgePreviews, setKnowledgePreviews] = React.useState<
    KnowledgePreview[]
  >([]);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const saveTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const steps = React.useMemo<Step[]>(() => {
    const baseSteps: Step[] = [
      {
        key: "initial",
        title: "Etapa inicial",
        description: "Dados essenciais para identificação e aceite.",
      },
      {
        key: "training",
        title: "Perguntas específicas para o treinamento do Agente",
      },
      {
        key: "product",
        title: "Agora vamos tratar sobre o seu produto/serviço",
      },
      {
        key: "sales",
        title: "Processo de vendas: qual a sua estratégia?",
        description: "Responda apenas se o Agente deve vender.",
        optional: true,
        enabled: values.shouldSell,
      },
      {
        key: "personalization",
        title: "Detalhes para personalizar seu Agente",
        optional: true,
      },
      {
        key: "integrations",
        title: "Integração com sistemas externos",
        optional: true,
      },
      {
        key: "scheduling",
        title: "Integração com sistema de agendamento",
        optional: true,
      },
      {
        key: "communication",
        title: "Comunicação do Agente",
      },
      {
        key: "links",
        title: "Links importantes para o Agente",
        optional: true,
      },
      {
        key: "extra",
        title:
          "Existe alguma informação que não foi solicitada e você deseja enviar?",
        optional: true,
      },
      {
        key: "final",
        title: "Concluído",
      },
    ];

    return baseSteps.filter((step) => step.enabled !== false);
  }, [values.shouldSell]);

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;

  React.useEffect(() => {
    if (!currentStep) {
      setCurrentStepIndex(0);
    } else if (currentStepIndex > steps.length - 1) {
      setCurrentStepIndex(steps.length - 1);
    }
  }, [currentStep, currentStepIndex, steps.length]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const storedFormId = window.localStorage.getItem(FORM_ID_KEY);
    const storedData = window.localStorage.getItem(FORM_DATA_KEY);
    const storedStep = window.localStorage.getItem(FORM_STEP_KEY);
    const storedStepsTimestamp = window.localStorage.getItem(
      FORM_STEP_TIMESTAMPS_KEY
    );

    if (storedFormId) {
      setFormId(storedFormId);
    } else {
      const newId = crypto.randomUUID();
      window.localStorage.setItem(FORM_ID_KEY, newId);
      setFormId(newId);
    }

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData) as FormValues;
        form.reset({ ...defaultValues, ...parsed });
      } catch {
        console.error("Failed to parse stored form data", error);
      }
    }

    if (storedStep) {
      const stepNumber = Number(storedStep);
      if (!Number.isNaN(stepNumber)) {
        setCurrentStepIndex(stepNumber);
      }
    }

    if (storedStepsTimestamp) {
      try {
        setStepTimestamps(JSON.parse(storedStepsTimestamp));
      } catch {
        console.error("Failed to parse step timestamps", error);
      }
    }
  }, [form]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(FORM_DATA_KEY, JSON.stringify(values));
  }, [values]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(FORM_STEP_KEY, String(currentStepIndex));
  }, [currentStepIndex]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      FORM_STEP_TIMESTAMPS_KEY,
      JSON.stringify(stepTimestamps)
    );
  }, [stepTimestamps]);

  React.useEffect(() => {
    return () => {
      knowledgePreviews.forEach((file) => URL.revokeObjectURL(file.previewUrl));
    };
  }, [knowledgePreviews]);

  const saveDraft = React.useCallback(
    async (statusOverride?: "draft" | "completed", stepIndex = currentStepIndex) => {
      if (!formId) return;

      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }

      setSavingStatus("saving");

      const payload = {
        formId,
        data: values,
        status: statusOverride ?? "draft",
        currentStep: stepIndex + 1,
        stepTimestamps,
      };

      try {
        const response = await fetch("/api/form", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to save");
        }

        setSavingStatus("saved");
        saveTimeout.current = setTimeout(() => {
          setSavingStatus("idle");
        }, 2000);
      } catch {
        setSavingStatus("error");
        saveTimeout.current = setTimeout(() => {
          setSavingStatus("idle");
        }, 2500);
      }
    },
    [currentStepIndex, formId, stepTimestamps, values]
  );

  const handleBlurSave = () => {
    void saveDraft("draft");
  };

  const markStepCompleted = (stepKey: StepKey) => {
    setStepTimestamps((prev) => ({
      ...prev,
      [stepKey]: new Date().toISOString(),
    }));
  };

  const isStepValid = React.useCallback(() => {
    if (!currentStep) return false;

    const requiredText = (value: string, min = 1) => value.trim().length >= min;

    switch (currentStep.key) {
      case "initial":
        return (
          requiredText(values.fullName, 3) &&
          values.fullName.length <= 255 &&
          isValidEmail(values.email) &&
          values.email.length <= 255 &&
          requiredText(values.agentRole) &&
          (values.agentRole !== "Outro" || requiredText(values.agentRoleOther)) &&
          values.termsAccepted
        );
      case "training":
        return (
          requiredText(values.agentName) &&
          requiredText(values.agentDescription) &&
          requiredText(values.agentRules) &&
          requiredText(values.agentTone) &&
          requiredText(values.agentBehaviors) &&
          requiredText(values.agentFocus) &&
          requiredText(values.agentGoal) &&
          requiredText(values.agentUnknownQuestions)
        );
      case "product":
        return (
          requiredText(values.productName) &&
          requiredText(values.productDescription) &&
          requiredText(values.productFeatures) &&
          requiredText(values.productDifferentials) &&
          requiredText(values.productAudience)
        );
      case "communication":
        return (
          requiredText(values.operationsPerStage) &&
          requiredText(values.followUpRules) &&
          requiredText(values.remindersRules) &&
          requiredText(values.responseTime)
        );
      default:
        return true;
    }
  }, [currentStep, values]);

  const handleNext = async () => {
    if (!currentStep) return;

    if (!isStepValid()) {
      await form.trigger();
      return;
    }

    markStepCompleted(currentStep.key);

    if (currentStep.key === "final") return;

    const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1);
    const nextStepKey = steps[nextIndex]?.key;
    setCurrentStepIndex(nextIndex);
    await saveDraft(nextStepKey === "final" ? "completed" : "draft", nextIndex);
  };

  const handleBack = async () => {
    const prevIndex = Math.max(currentStepIndex - 1, 0);
    setCurrentStepIndex(prevIndex);
    await saveDraft("draft", prevIndex);
  };

  const handleSkip = async () => {
    const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1);
    const nextStepKey = steps[nextIndex]?.key;
    setCurrentStepIndex(nextIndex);
    await saveDraft(nextStepKey === "final" ? "completed" : "draft", nextIndex);
  };

  const resetForNewForm = () => {
    form.reset(defaultValues);
    const newId = crypto.randomUUID();
    setFormId(newId);
    setCurrentStepIndex(0);
    setStepTimestamps({});
    setKnowledgePreviews([]);
    setUploadError(null);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(FORM_ID_KEY, newId);
      window.localStorage.removeItem(FORM_DATA_KEY);
      window.localStorage.setItem(FORM_STEP_KEY, "0");
      window.localStorage.removeItem(FORM_STEP_TIMESTAMPS_KEY);
    }
  };

  const handleEditForm = () => {
    setCurrentStepIndex(0);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !formId) return;

    setUploadError(null);

    const validFiles = Array.from(files).filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError("Arquivos devem ter no máximo 10MB.");
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const baseFolder = `${slugify(values.fullName || "cliente")}-${formId}`;

    for (const file of validFiles) {
      const fileId = crypto.randomUUID();
      const path = `${baseFolder}/${fileId}-${file.name}`;

      const { error } = await supabaseClient
        .storage
        .from(BUCKET_NAME)
        .upload(path, file, { upsert: false });

      if (error) {
        setUploadError("Erro ao enviar arquivo. Tente novamente.");
        continue;
      }

      const previewUrl = URL.createObjectURL(file);

      setKnowledgePreviews((prev) => [
        ...prev,
        {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          path,
          previewUrl,
        },
      ]);

      const existing = form.getValues("knowledgeBaseFiles") ?? [];
      form.setValue(
        "knowledgeBaseFiles",
        [...existing, { name: file.name, size: file.size, type: file.type, path }],
        { shouldDirty: true }
      );
    }

    await saveDraft("draft");
  };

  const removeKnowledgeFile = async (file: KnowledgePreview) => {
    setKnowledgePreviews((prev) => prev.filter((item) => item.id !== file.id));
    URL.revokeObjectURL(file.previewUrl);

    const remaining = form
      .getValues("knowledgeBaseFiles")
      .filter((item) => item.path !== file.path);
    form.setValue("knowledgeBaseFiles", remaining, { shouldDirty: true });

    const { error } = await supabaseClient
      .storage
      .from(BUCKET_NAME)
      .remove([file.path]);

    if (error) {
      setUploadError("Não foi possível remover o arquivo do storage.");
    }

    await saveDraft("draft");
  };

  const progressValue = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-semibold tracking-[0.25em] text-muted-foreground">
              <span className="logo-gradient">IA FOUR SALES</span>
            </div>
            <SaveStatus status={savingStatus} />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Criação do seu Agente de IA
            </h1>
            <p className="text-sm text-muted-foreground">
              Preencha as informações com calma. Salvamos automaticamente conforme você avança.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Etapa {currentStepIndex + 1} de {totalSteps}
              </span>
              <span className="uppercase tracking-[0.2em]">Progresso</span>
            </div>
            <Progress value={progressValue} />
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentStep?.title ?? ""}
            </CardTitle>
            {currentStep?.description ? (
              <p className="text-sm text-muted-foreground">
                {currentStep.description}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-8">
            {currentStep?.key === "initial" ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Digite seu nome completo</Label>
                  <Input
                    id="fullName"
                    placeholder="Digite seu nome completo"
                    {...form.register("fullName", {
                      required: "Nome completo e obrigatório",
                      minLength: {
                        value: 3,
                        message: "Mínimo de 3 caracteres",
                      },
                      maxLength: {
                        value: 255,
                        message: "Máximo de 255 caracteres",
                      },
                    })}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Precisamos do seu nome para identificar o projeto internamente.
                  </p>
                  {form.formState.errors.fullName ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.fullName.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Me fala teu email?</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="você@empresa.com"
                    {...form.register("email", {
                      required: "Email e obrigatório",
                      maxLength: {
                        value: 255,
                        message: "Máximo de 255 caracteres",
                      },
                      validate: (value) =>
                        isValidEmail(value) || "Email invalido",
                    })}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Vamos usar este email para contato e alinhamentos.
                  </p>
                  {form.formState.errors.email ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Escolha a função principal do seu Agente</Label>
                  <Controller
                    control={form.control}
                    name="agentRole"
                    rules={{ required: "Selecione uma opção" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleBlurSave();
                        }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Selecione o perfil para personalizarmos o comportamento base.
                  </p>
                  {form.formState.errors.agentRole ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.agentRole.message}
                    </p>
                  ) : null}
                </div>
                {values.agentRole === "Outro" ? (
                  <div className="space-y-2">
                    <Label htmlFor="agentRoleOther">Qual é a função principal?</Label>
                    <Input
                      id="agentRoleOther"
                      placeholder="Descreva a função principal"
                      {...form.register("agentRoleOther", {
                        required: "Descreva a função",
                      })}
                      onBlur={handleBlurSave}
                    />
                    <p className="text-xs text-muted-foreground">
                      Informe o nome exato da função para alinharmos o agente.
                    </p>
                    {form.formState.errors.agentRoleOther ? (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.agentRoleOther.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                <div className="rounded-md border border-dashed p-4">
                  <div className="flex items-start gap-3">
                    <Controller
                      control={form.control}
                      name="termsAccepted"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(value) => {
                            field.onChange(Boolean(value));
                            if (value) {
                              form.setValue(
                                "termsAcceptedAt",
                                new Date().toISOString(),
                                { shouldDirty: true }
                              );
                            }
                            handleBlurSave();
                          }}
                        />
                      )}
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Aceite LGPD</p>
                      <p className="text-xs text-muted-foreground">
                        Autorizo o uso dos dados enviados para criação do meu Agente de IA.
                      </p>
                      {!values.termsAccepted ? (
                        <p className="text-xs text-destructive">
                          Você precisa aceitar para continuar.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep?.key === "training" ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Nome do Agente</Label>
                  <Input
                    placeholder="Como o Agente deve se apresentar"
                    {...form.register("agentName", {
                      required: "Campo obrigatório",
                    })}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este nome sera usado para o Agente se identificar.
                  </p>
                  {form.formState.errors.agentName ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.agentName.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Descrição breve do Agente</Label>
                  <Textarea
                    placeholder="Ex: Agente SDR responsável por interagir com leads"
                    {...form.register("agentDescription", {
                      required: "Campo obrigatório",
                    })}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Descreva em poucas linhas a função do Agente.
                  </p>
                  {form.formState.errors.agentDescription ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.agentDescription.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Quais regras invioláveis o Agente deve seguir?</Label>
                  <Textarea
                    placeholder="Ex: não solicitar documentos, não fornecer informações confidenciais"
                    {...form.register("agentRules", {
                      required: "Campo obrigatório",
                    })}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Liste regras que nunca podem ser descumpridas.
                  </p>
                  {form.formState.errors.agentRules ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.agentRules.message}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Qual tom de voz do Agente?</Label>
                    <Input
                      placeholder="Ex: informal, formal, consultivo"
                      {...form.register("agentTone", {
                        required: "Campo obrigatório",
                      })}
                      onBlur={handleBlurSave}
                    />
                    <p className="text-xs text-muted-foreground">
                      Defina como o Agente deve se comunicar.
                    </p>
                    {form.formState.errors.agentTone ? (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.agentTone.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label>Comportamentos a adotar/evitar</Label>
                    <Input
                      placeholder="Ex: ser amigavel, jamais destratar o lead"
                      {...form.register("agentBehaviors", {
                        required: "Campo obrigatório",
                      })}
                      onBlur={handleBlurSave}
                    />
                    <p className="text-xs text-muted-foreground">
                      Destaque comportamentos desejados e proibidos.
                    </p>
                    {form.formState.errors.agentBehaviors ? (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.agentBehaviors.message}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Há algum foco principal específico?</Label>
                    <Input
                      placeholder="Ex: qualificar e quebrar objeções"
                      {...form.register("agentFocus", {
                        required: "Campo obrigatório",
                      })}
                      onBlur={handleBlurSave}
                    />
                    <p className="text-xs text-muted-foreground">
                    Defina as prioridades da atuação do Agente.
                    </p>
                    {form.formState.errors.agentFocus ? (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.agentFocus.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label>Qual é o principal objetivo do Agente?</Label>
                    <Input
                      placeholder="Ex: converter leads qualificados"
                      {...form.register("agentGoal", {
                        required: "Campo obrigatório",
                      })}
                      onBlur={handleBlurSave}
                    />
                    <p className="text-xs text-muted-foreground">
                      Deixe claro o objetivo final esperado.
                    </p>
                    {form.formState.errors.agentGoal ? (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.agentGoal.message}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Como o Agente deve lidar com perguntas que não sabe responder?</Label>
                  <Textarea
                    placeholder="Ex: transferir para atendente humano"
                    {...form.register("agentUnknownQuestions", {
                      required: "Campo obrigatório",
                    })}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Explique o fluxo para perguntas fora do escopo.
                  </p>
                  {form.formState.errors.agentUnknownQuestions ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.agentUnknownQuestions.message}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {currentStep?.key === "product" ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Nome do produto/serviço</Label>
                  <Input
                    placeholder="Ex: Produto XYZ, Serviço ABC"
                    {...form.register("productName", {
                      required: "Campo obrigatório",
                    })}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Informe exatamente como o produto/serviço sera apresentado.
                  </p>
                  {form.formState.errors.productName ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.productName.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Descrição detalhada</Label>
                  <Textarea
                    placeholder="Detalhe o produto/serviço com o máximo de clareza"
                    {...form.register("productDescription", {
                      required: "Campo obrigatório",
                    })}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Inclua contexto, funcionamento e qualquer diferencial importante.
                  </p>
                  {form.formState.errors.productDescription ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.productDescription.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Principais características e benefícios</Label>
                  <Textarea
                    placeholder="Liste os principais benefícios e recursos"
                    {...form.register("productFeatures", {
                      required: "Campo obrigatório",
                    })}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ajuda o Agente a destacar o que torna o produto atrativo.
                  </p>
                  {form.formState.errors.productFeatures ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.productFeatures.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Diferenciais competitivos</Label>
                  <Textarea
                    placeholder="O que diferencia você da concorrência?"
                    {...form.register("productDifferentials", {
                      required: "Campo obrigatório",
                    })}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Destaque o que torna sua oferta única.
                  </p>
                  {form.formState.errors.productDifferentials ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.productDifferentials.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Público-alvo</Label>
                  <Input
                    placeholder="Ex: pequenas empresas, gestores de marketing"
                    {...form.register("productAudience", {
                      required: "Campo obrigatório",
                    })}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ajude o Agente a entender com quem deve falar.
                  </p>
                  {form.formState.errors.productAudience ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.productAudience.message}
                    </p>
                  ) : null}
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4 rounded-md border bg-secondary/40 p-4">
                  <div>
                    <p className="text-sm font-medium">Meu Agente deve vender</p>
                    <p className="text-xs text-muted-foreground">
                      Ative se o Agente precisa seguir uma estratégia de vendas.
                    </p>
                  </div>
                  <Controller
                    control={form.control}
                    name="shouldSell"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          handleBlurSave();
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            ) : null}

            {currentStep?.key === "sales" ? (
              <div className="space-y-6">
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Observação: responda apenas se você acredita que o seu Agente deve vender.
                </div>
                <div className="space-y-2">
                  <Label>Processo de vendas atual (funil de vendas)</Label>
                  <Textarea
                    placeholder="Descreva etapas e passagens do funil"
                    {...form.register("salesProcess")}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ajuda a replicar o processo que você já utiliza.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Principais objeções enfrentadas</Label>
                  <Textarea
                    placeholder="Ex: preco, qualidade, prazo"
                    {...form.register("salesObjections")}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Liste os principais bloqueios que seus leads apresentam.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Como o Agente deve lidar com as objeções?</Label>
                  <Textarea
                    placeholder="Explique como contornar as objeções"
                    {...form.register("salesObjectionsHandling")}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Detalhe argumentos e abordagens preferidas.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Metas de vendas para o Agente</Label>
                  <Input
                    placeholder="Ex: vender 10 leads no mês"
                    {...form.register("salesGoals")}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Indique metas quantitativas ou qualitativas.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Como o Agente deve se comunicar com os leads?</Label>
                  <Input
                    placeholder="Ex: telefone, email, chat"
                    {...form.register("salesChannels")}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Defina os canais permitidos para conversas de venda.
                  </p>
                </div>
              </div>
            ) : null}

            {currentStep?.key === "personalization" ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Você tem casos de sucesso relevantes?</Label>
                  <Textarea
                    placeholder="Descreva casos e resultados importantes"
                    {...form.register("successCases")}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use exemplos reais para reforçar a argumentação.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Script de vendas, atendimento ou abordagens</Label>
                  <Textarea
                    placeholder="Cole aqui scripts ou fluxos bem-sucedidos"
                    {...form.register("scripts")}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Isso ajuda o Agente a replicar boas praticas.
                  </p>
                </div>
                <div className="space-y-3">
                  <Label>Acesso a base de conhecimentos</Label>
                  <p className="text-xs text-muted-foreground">
                    Aqui você pode inserir arquivos para alimentar a base do Agente (limite de 10MB por arquivo).
                  </p>
                  <Input
                    type="file"
                    multiple
                    onChange={(event) => handleFileUpload(event.target.files)}
                  />
                  {uploadError ? (
                    <p className="text-xs text-destructive">{uploadError}</p>
                  ) : null}
                  {knowledgePreviews.length > 0 ? (
                    <div className="space-y-3">
                      {knowledgePreviews.map((file) => (
                        <div
                          key={file.id}
                          className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => window.open(file.previewUrl, "_blank")}
                            >
                              Visualizar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => removeKnowledgeFile(file)}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {currentStep?.key === "integrations" ? (
              <div className="space-y-6">
                <ListInput
                  label="Sistemas externos que o Agente deve integrar"
                  description="Adicione CRMs, ERPs ou plataformas externas."
                  placeholder="Ex: HubSpot"
                  items={values.externalSystems}
                  onChange={(items) =>
                    form.setValue("externalSystems", items, { shouldDirty: true })
                  }
                  onSave={handleBlurSave}
                />
                <ListInput
                  label="Funcionalidades principais que o Agente deve acessar"
                  description="Ex: criar leads, atualizar dados, consultar status."
                  placeholder="Ex: atualizar informações do cliente"
                  items={values.externalFeatures}
                  onChange={(items) =>
                    form.setValue("externalFeatures", items, { shouldDirty: true })
                  }
                  onSave={handleBlurSave}
                />
              </div>
            ) : null}

            {currentStep?.key === "scheduling" ? (
              <div className="space-y-6">
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Aqui você pode integrar o Agente com Calendly, Google Calendar ou Outlook Calendar.
                </div>
                <div className="space-y-2">
                  <Label>Ferramenta de agendamento utilizada</Label>
                  <Input
                    placeholder="Ex: Calendly, Google Calendar"
                    {...form.register("schedulingTool")}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Informe a ferramenta preferida para agendamentos.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Horarios disponíveis para agendamento</Label>
                  <Input
                    placeholder="Ex: 9h as 18h, segunda a sexta"
                    {...form.register("schedulingAvailability")}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Indique a disponibilidade de agenda.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Informações necessárias para agendamento</Label>
                  <Textarea
                    placeholder="Ex: nome, email, telefone"
                    {...form.register("schedulingRequiredInfo")}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Defina quais dados o Agente deve solicitar.
                  </p>
                </div>
              </div>
            ) : null}

            {currentStep?.key === "communication" ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Como o Agente deve operar em cada etapa?</Label>
                  <Textarea
                    placeholder="Descreva o fluxo de operação"
                    {...form.register("operationsPerStage", {
                      required: "Campo obrigatório",
                    })}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ajude a configurar regras por etapa da jornada.
                  </p>
                  {form.formState.errors.operationsPerStage ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.operationsPerStage.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Follow-ups: deseja que o Agente realize? Quais regras?</Label>
                  <Textarea
                    placeholder="Ex: follow-up em 24h, máximo 3 tentativas"
                    {...form.register("followUpRules", {
                      required: "Campo obrigatório",
                    })}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Defina quando e como o Agente deve retornar.
                  </p>
                  {form.formState.errors.followUpRules ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.followUpRules.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Como o Agente deve enviar lembretes?</Label>
                  <Textarea
                    placeholder="Ex: lembrete 15 minutos antes da reunião"
                    {...form.register("remindersRules", {
                      required: "Campo obrigatório",
                    })}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Configure horarios e tipos de lembrete.
                  </p>
                  {form.formState.errors.remindersRules ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.remindersRules.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Qual é o tempo de resposta esperado do Agente?</Label>
                  <Input
                    placeholder="Ex: responder em até 2 minutos"
                    {...form.register("responseTime", {
                      required: "Campo obrigatório",
                    })}
                    onBlur={handleBlurSave}
                  />
                  <p className="text-xs text-muted-foreground">
                    Defina o SLA desejado para respostas do Agente.
                  </p>
                  {form.formState.errors.responseTime ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.responseTime.message}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {currentStep?.key === "links" ? (
              <div className="space-y-6">
                <ListInput
                  label="Links importantes"
                  description="Inclua links de produtos, paginas e materiais relevantes."
                  placeholder="https://seusite.com"
                  items={values.importantLinks}
                  onChange={(items) =>
                    form.setValue("importantLinks", items, { shouldDirty: true })
                  }
                  onSave={handleBlurSave}
                />
              </div>
            ) : null}

            {currentStep?.key === "extra" ? (
              <div className="space-y-2">
                <Label>Informações adicionais</Label>
                <Textarea
                  placeholder="Envie qualquer detalhe extra que possa ajudar"
                  {...form.register("extraInfo")}
                  onBlur={handleBlurSave}
                />
                <p className="text-xs text-muted-foreground">
                  Caso tenha algo importante que não perguntamos, registre aqui.
                </p>
              </div>
            ) : null}

            {currentStep?.key === "final" ? (
              <div className="flex flex-col items-center gap-6 py-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 text-white">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-semibold">
                    Obrigado por preencher o formulário.
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Nossa equipe já esta com todos os dados em mãos para trabalhar neste projeto, em breve retornamos contato.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="button" variant="secondary" onClick={handleEditForm}>
                    Editar formulário
                  </Button>
                  <Button type="button" onClick={resetForNewForm}>
                    Enviar outro formulário
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {currentStep?.key !== "final" ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              {currentStep?.optional ? (
                <Button type="button" variant="outline" onClick={handleSkip}>
                  Pular etapa
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Continuar
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
