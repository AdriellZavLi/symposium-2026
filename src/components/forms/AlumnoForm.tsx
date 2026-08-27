"use client";

import { useState } from "react";
import FormField from "./FormField";
import { registroAlumnoSchema, SEMESTRES_VALIDOS } from "@/lib/validations";
import { z } from "zod";

interface Talla {
  id: number;
  nombre: string;
}

interface AlumnoFormProps {
  tallas: Talla[];
  onSuccess: () => void;
}

export default function AlumnoForm({ tallas, onSuccess }: AlumnoFormProps) {
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    correo: "",
    telefono: "",
    matricula: "",
    semestre: "",
    tallaPlayera: "",
    tallaCamisa: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
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
      // Validate
      const parsedData = {
        ...formData,
        semestre: parseInt(formData.semestre) || 0
      };
      
      registroAlumnoSchema.parse(parsedData);

      // Submit
      const response = await fetch("/api/registro/alumno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedData)
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
  const semestreOptions = SEMESTRES_VALIDOS.map(s => ({ value: s, label: s.toString() }));

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
            placeholder="Juan Pérez García"
          />
        </div>

        <FormField
          label="Matrícula"
          name="matricula"
          type="text"
          value={formData.matricula}
          onChange={handleChange}
          error={errors.matricula}
          required
          placeholder="Ejemplo: 23100225"
          helpText="Debe tener 8 dígitos y el 3ro y 4to deben ser '10'"
        />

        <FormField
          label="Semestre"
          name="semestre"
          type="select"
          value={formData.semestre}
          onChange={handleChange}
          error={errors.semestre}
          required
          options={semestreOptions}
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
