import { MoveLeft } from "lucide-react";
import { SubmitEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { C } from "@/constants/colors";
import { Ic } from "@/constants/crisp-svg";
import { useAuthStore } from "@/store/auth-store";
import { useSignUpStore } from "@/store/useSignUpStore";

import { DistrictSelect } from "../DistrictSelect";
import { IntrestPicker } from "../IntrestPicker";
import { SpecialtyPicker } from "../SpecialtyPicker";

const SignUpForm = () => {
  const { next, back, role, specialties, district, interests } = useSignUpStore();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [fields, setFields] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    terms: false,
  });

  const passwordMismatch = fields.confirm.length > 0 && fields.password !== fields.confirm;

  const isValid =
    fields.fullName.trim().length > 1 &&
    fields.email.includes("@") &&
    fields.phone.trim().length >= 9 &&
    fields.password.length >= 8 &&
    !passwordMismatch &&
    fields.terms &&
    district !== "" &&
    (role === "buyer" ? interests.length > 0 : true) &&
    (role === "farmer" ? specialties.length > 0 : true) &&
    (role === "both" ? specialties.length > 0 && interests.length > 0 : true);

  function update<K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) {
    if (error) clearError();
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!isValid || isLoading) return;

    const base = {
      fullName: fields.fullName,
      email: fields.email,
      phone: fields.phone,
      password: fields.password,
      district,
    };

    const payload =
      role === "buyer"
        ? { ...base, role: role as "buyer" | "both", interests }
        : { ...base, role: role as "farmer" | "both", specialties };
    try {
      await register(payload);
      next(); // only advances on success
    } catch {
      // Errors handled in store
    }
  }

  return (
    <form className="w-full max-w-sm" onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <h3 className="font-bold text-2xl">Create your account</h3>
          <p className="text-muted-foreground text-sm">
            Already have an account? <Button variant="link">Sign in</Button>
          </p>
        </Field>

        {/* Server error */}
        {error && (
          <div className="rounded-[10px] bg-destructive/10 border border-destructive/20 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="form-name">
            Full Name <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="form-name"
            type="text"
            className="h-11"
            placeholder="Kasule Andrew"
            leftIcon={<Ic n="user" s={18} c={C.muted} />}
            value={fields.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="form-email">Email</FieldLabel>
          <Input
            id="form-email"
            type="email"
            placeholder="andrew@example.com"
            className="h-11"
            leftIcon={<Ic n="mail" s={18} c={C.muted} />}
            value={fields.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          <FieldDescription>We'll never share your email with anyone.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="form-phone">
            Phone Number <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="form-phone"
            type="tel"
            placeholder="7XX XXX XXX"
            className="h-11"
            value={fields.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
          />
        </Field>

        <DistrictSelect />

        {(role === "farmer" || role === "both") && <SpecialtyPicker />}
        {(role === "buyer" || role === "both") && <IntrestPicker />}

        <Field>
          <FieldLabel htmlFor="form-password">
            Password <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="form-password"
            type="password"
            placeholder="Min 8 chars"
            className="h-11"
            value={fields.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="form-password-confirm">
            Confirm Password <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="form-password-confirm"
            type="password"
            placeholder="Repeat password"
            className="h-11"
            value={fields.confirm}
            onChange={(e) => update("confirm", e.target.value)}
            required
          />
          {passwordMismatch && (
            <p className="text-xs text-destructive mt-1">Passwords do not match.</p>
          )}
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="terms-checkbox"
            checked={fields.terms}
            onCheckedChange={(v) => update("terms", !!v)}
          />
          <FieldLabel htmlFor="terms-checkbox" className="text-muted-foreground">
            <p className="text-xs">
              I agree to Shamba's{" "}
              <span className="text-primary">Terms of Service, Privacy Policy</span>, and{" "}
              <span className="text-primary">Farmer Agreement.</span>
            </p>
          </FieldLabel>
        </Field>

        <Field>
          <Button type="submit" className="w-full h-11 mt-4" disabled={isLoading || !isValid}>
            {isLoading ? (
              "Creating account…"
            ) : (
              <>
                Create Account <Ic n="arrow" s={18} c="var(--primary-foreground)" />
              </>
            )}
          </Button>
        </Field>

        <Field>
          <Button
            type="button"
            className="w-full h-11"
            variant="ghost"
            onClick={back}
            disabled={isLoading}
          >
            <MoveLeft /> Back
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default SignUpForm;
