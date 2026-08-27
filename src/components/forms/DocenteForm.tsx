"use client";

import { useState } from "react";
import FormField from "./FormField";
import { registroDocenteSchema } from "@/lib/validations";
import { z } from "zod";

interface Talla {
  id: number;
  nombre: string;
}

interface DocenteFormProps {
  tallas: Talla[];
  onSuccess: () => void;
}

export default function DocenteForm({ tallas, onSuccess }: DocenteFormProps) {
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    correo: "",
    telefono: "",
    numeroEmpleado: "",
    departamento: "",
    academia: "",
    tallaPlayera: "",
    tallaCamisa: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError("");
    setLoading(true);

    try {
      registroDocenteSchema.parse(formData);

      const response = await fetch("/api/registro/docente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar");
      }

      onSuccess();
    } catch (err) {
      if (err && typeof err === 'object' && 'errors' in err) {
        const newErrors: Record<string, string> = {};
        (err as any).errors.forEach((e: any) => {
          if (e.path[0]) newErrors[e.path[0].toString()] = e.message;
        });
        setErrors(newErrors);
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const tallaOptions = tallas.map(t => ({ value: t.nombre, label: t.nombre }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <FormField
            label="Nombre Completo"
            name="nombreCompleto"
            type="text"
            value={formData.nombreCompleto}
            onChange={handleChange}
            error={errors.nombreCompleto}
            required
            placeholder="María López Ruiz"
          />
        </div>

        <FormField
          label="Número de Empleado"
          name="numeroEmpleado"
          type="text"
          value={formData.numeroEmpleado}
          onChange={handleChange}
          error={errors.numeroEmpleado}
          required
          placeholder="Ej: 12345"
        />

        <FormField
          label="Departamento"
          name="departamento"
          type="text"
          value={formData.departamento}
          onChange={handleChange}
          error={errors.departamento}
          required
          placeholder="Sistemas y Computación"
        />

        <FormField
          label="Academia (Opcional)"
          name="academia"
          type="text"
          value={formData.academia}
          onChange={handleChange}
          error={errors.academia}
          placeholder="Programación"
        />

        <FormField
          label="Correo Electrónico"
          name="correo"
          type="email"
          value={formData.correo}
          onChange={handleChange}
          error={errors.correo}
          required
          placeholder="ejemplo@correo.com"
        />

        <FormField
          label="Teléfono"
          name="telefono"
          type="tel"
          value={formData.telefono}
          onChange={handleChange}
          error={errors.telefono}
          required
          placeholder="8712345678"
        />

        <FormField
          label="Talla de Playera"
          name="tallaPlayera"
          type="select"
          value={formData.tallaPlayera}
          onChange={handleChange}
          error={errors.tallaPlayera}
          required
          options={tallaOptions}
        />

        <FormField
          label="Talla de Camisa"
          name="tallaCamisa"
          type="select"
          value={formData.tallaCamisa}
          onChange={handleChange}
          error={errors.tallaCamisa}
          required
          options={tallaOptions}
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Registrando..." : "Completar Registro"}
        </button>
      </div>
    </form>
  );
}
