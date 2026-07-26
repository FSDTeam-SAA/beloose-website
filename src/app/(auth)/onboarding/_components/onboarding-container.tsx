"use client";

import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  PackagePlus,
  QrCode,
  Rocket,
  Store,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import BusinessInformationStep from "./business-information-step";
import FirstHumidorStep from "./first-humidor-step";
import InventoryStep from "./inventory-step";
import QrCodeStep from "./qr-code-step";
import ReadyToLaunchStep from "./ready-to-launch-step";
import type {
  BusinessInformationField,
  InventoryField,
  OnboardingData,
} from "./onboarding-types";
import { getOnboardingStep, type OnboardingStatus } from "@/lib/onboarding";

const initialData: OnboardingData = {
  storeName: "",
  address: "",
  city: "",
  phoneNumber: "",
  description: "",
  retailerId: "",
  humidorName: "",
  humidorLocation: "",
  humidorDescription: "",
  shelfes: [{ name: "", description: "" }],
  humidorId: "",
  inventoryName: "",
  inventoryBrand: "",
  inventoryStrength: "medium",
  inventoryWrapper: "",
  inventorySize: "",
  inventoryDescription: "",
  inventoryPairingSuggestions: [],
  inventoryShelfName: "",
  inventoryQuantity: "",
  inventoryPrice: "",
  lowStockThreshold: "5",
  isStaffPick: false,
  staffPickNote: "",
  staffPickBy: "",
  isNewArrival: false,
  arrivalDate: "",
  isDailyFeatured: false,
  featuredNote: "",
  inventoryId: "",
  qrStyle: "Classic Gold",
  qrPlacement: "At each shelf",
};

const steps = [
  { title: "Business Information", short: "Business Info", icon: Store },
  { title: "Create First Humidor", short: "First Humidor", icon: Box },
  { title: "Import / Add Inventory", short: "Inventory", icon: PackagePlus },
  { title: "Generate QR Codes", short: "QR Codes", icon: QrCode },
  { title: "Ready to Launch!", short: "Launch", icon: Rocket },
];

const requiredFields: (keyof OnboardingData)[][] = [
  ["storeName", "address", "city", "phoneNumber", "description"],
  ["humidorName", "humidorLocation", "humidorDescription"],
  ["inventoryName", "inventoryBrand", "inventoryStrength", "inventoryWrapper", "inventorySize", "inventoryDescription", "inventoryShelfName", "inventoryQuantity", "inventoryPrice", "lowStockThreshold"],
  [],
  [],
];

const normalizePhoneNumber = (value: string) => {
  const input = value.trim();
  const phoneNumber = input.replace(/\D/g, "");

  if (/^01[3-9]\d{8}$/.test(phoneNumber)) {
    return `+88${phoneNumber}`;
  }
  if (/^8801[3-9]\d{8}$/.test(phoneNumber)) {
    return `+${phoneNumber}`;
  }
  if (input.startsWith("+")) {
    return `+${phoneNumber}`;
  }

  return phoneNumber;
};

const OnboardingContainer = () => {
  const router = useRouter();
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const sessionUser = session?.user;
  const accessToken = (sessionUser as { accessToken?: string } | undefined)?.accessToken;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [inventoryImage, setInventoryImage] = useState<File | null>(null);
  const [qrReady, setQrReady] = useState(false);
  const hasInitializedStep = useRef(false);
  const hasUserNavigated = useRef(false);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace("/login?callbackUrl=/onboarding");
      return;
    }
    if (sessionStatus !== "authenticated" || !sessionUser) return;
    if (hasInitializedStep.current) return;

    // Backend status chooses the initial step once. After that, navigation
    // remains user-controlled so Back/Continue cannot be overwritten.
    hasInitializedStep.current = true;

    setStep(getOnboardingStep(sessionUser));

    const loadCurrentStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/user/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        });
        const result = (await response.json()) as {
          data?: OnboardingStatus;
        };
        if (!response.ok || !result.data) return;

        const currentStep = getOnboardingStep(result.data);
        if (!hasUserNavigated.current) setStep(currentStep);
        await updateSession(result.data);

        if (currentStep === 2) {
          const humidorResponse = await fetch(
            `${apiUrl}/humidor/my-humidor?limit=1`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              cache: "no-store",
            },
          );
          const humidorResult = (await humidorResponse.json()) as {
            data?: Array<{
              _id: string;
              shelfes?: Array<{ name: string; description?: string }>;
            }>;
          };
          const humidor = humidorResult.data?.[0];
          if (humidorResponse.ok && humidor) {
            setData((current) => ({
              ...current,
              humidorId: humidor._id,
              shelfes: humidor.shelfes?.length
                ? humidor.shelfes.map((shelf) => ({
                    name: shelf.name,
                    description: shelf.description || "",
                  }))
                : current.shelfes,
            }));
          }
        }
      } catch {
        // The signed-in session still provides a safe starting step offline.
      }
    };

    void loadCurrentStatus();
  }, [accessToken, apiUrl, router, sessionStatus, sessionUser, updateSession]);

  useEffect(() => {
    const saved = localStorage.getItem("humidor411-onboarding");
    if (saved) {
      try {
        setData({ ...initialData, ...JSON.parse(saved) });
      } catch {
        localStorage.removeItem("humidor411-onboarding");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("humidor411-onboarding", JSON.stringify(data));
  }, [data]);

  const update = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setData((current) => ({ ...current, [name]: value }));
  };

  const updateBusinessField = (
    field: BusinessInformationField,
    value: string,
  ) => {
    setData((current) => ({ ...current, [field]: value }));
  };

  const updateInventoryField = (
    field: InventoryField,
    value: string | boolean | string[],
  ) => {
    setData((current) => ({ ...current, [field]: value }));
  };

  const updateShelf = (
    index: number,
    field: "name" | "description",
    value: string,
  ) => {
    setData((current) => ({
      ...current,
      shelfes: current.shelfes.map((shelf, shelfIndex) =>
        shelfIndex === index ? { ...shelf, [field]: value } : shelf,
      ),
    }));
  };

  const addShelf = () => {
    setData((current) => ({
      ...current,
      shelfes: [...current.shelfes, { name: "", description: "" }],
    }));
  };

  const removeShelf = (index: number) => {
    setData((current) => ({
      ...current,
      shelfes: current.shelfes.filter((_, shelfIndex) => shelfIndex !== index),
    }));
  };

  const { mutateAsync: createRetailer, isPending: isCreatingRetailer } =
    useMutation({
      mutationKey: ["create-retailer"],
      mutationFn: async () => {
        if (!accessToken) {
          throw new Error("Your session has expired. Please log in again.");
        }
        const response = await fetch(`${apiUrl}/retailer`, {
          method: "POST",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storeName: data.storeName.trim(),
            address: data.address.trim(),
            phoneNumber: normalizePhoneNumber(data.phoneNumber),
            city: data.city.trim(),
            description: data.description.trim(),
          }),
        });

        const result = (await response.json()) as {
          success?: boolean;
          message?: string;
          data?: { _id?: string };
          errorSources?: Array<{ message?: string }>;
        };

        if (!response.ok || !result.success || !result.data?._id) {
          throw new Error(
            result.errorSources?.[0]?.message ||
              result.message ||
              "Could not create retailer profile",
          );
        }

        return result;
      },
    });

  const { mutateAsync: createHumidor, isPending: isCreatingHumidor } =
    useMutation({
      mutationKey: ["create-humidor"],
      mutationFn: async () => {
        if (!accessToken) {
          throw new Error("Your session has expired. Please log in again.");
        }
        const response = await fetch(`${apiUrl}/humidor`, {
          method: "POST",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.humidorName.trim(),
            location: data.humidorLocation.trim(),
            description: data.humidorDescription.trim(),
            shelfes: data.shelfes.map((shelf) => ({
              name: shelf.name.trim(),
              description: shelf.description.trim(),
            })),
          }),
        });

        const result = (await response.json()) as {
          success?: boolean;
          message?: string;
          data?: { _id?: string };
        };

        if (!response.ok || !result.success || !result.data?._id) {
          throw new Error(result.message || "Could not create humidor");
        }

        return result;
      },
    });

  const { mutateAsync: createInventory, isPending: isCreatingInventory } =
    useMutation({
      mutationKey: ["create-inventory"],
      mutationFn: async () => {
        if (!accessToken) {
          throw new Error("Your session has expired. Please log in again.");
        }
        if (!data.humidorId) {
          throw new Error("Please create a humidor before adding inventory.");
        }
        if (!inventoryImage) {
          throw new Error("Please select a cigar image.");
        }

        const formData = new FormData();
        formData.append("name", data.inventoryName.trim());
        formData.append("brand", data.inventoryBrand.trim());
        formData.append("strength", data.inventoryStrength);
        formData.append("wrapper", data.inventoryWrapper.trim());
        formData.append("size", data.inventorySize.trim());
        formData.append("description", data.inventoryDescription.trim());
        data.inventoryPairingSuggestions.forEach((suggestion) => {
          formData.append("pairingSuggestions", suggestion);
        });
        formData.append("humidorId", data.humidorId);
        formData.append("shelfName", data.inventoryShelfName);
        formData.append("quantity", data.inventoryQuantity);
        formData.append("price", data.inventoryPrice);
        formData.append("lowStockThreshold", data.lowStockThreshold);
        formData.append("isStaffPick", String(data.isStaffPick));
        formData.append("staffPickNote", data.staffPickNote.trim());
        formData.append("staffPickBy", data.staffPickBy.trim());
        formData.append("isNewArrival", String(data.isNewArrival));
        formData.append("arrivalDate", data.arrivalDate);
        formData.append("isDailyFeatured", String(data.isDailyFeatured));
        formData.append("featuredNote", data.featuredNote.trim());
        formData.append("image", inventoryImage);

        const response = await fetch(`${apiUrl}/inventory`, {
          method: "POST",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });
        const result = (await response.json()) as {
          success?: boolean;
          message?: string;
          data?: { _id?: string };
        };

        if (!response.ok || !result.success || !result.data?._id) {
          throw new Error(result.message || "Could not create inventory item");
        }
        return result;
      },
    });

  const next = async () => {
    const missing = requiredFields[step].some((field) => {
      const value = data[field];
      return typeof value !== "string" || !value.trim();
    });
    if (missing) {
      toast.error("Please complete all required fields");
      return;
    }

    if (
      step === 1 &&
      data.shelfes.some((shelf) => !shelf.name.trim() || !shelf.description.trim())
    ) {
      toast.error("Please complete the name and description for every shelf");
      return;
    }

    if (step === 2 && !inventoryImage && !data.inventoryId) {
      toast.error("Please select a cigar image");
      return;
    }
    if (step === 3 && !qrReady) {
      toast.error("Please wait until your QR code is ready");
      return;
    }
    if (step === 2 && data.isStaffPick && (!data.staffPickBy.trim() || !data.staffPickNote.trim())) {
      toast.error("Please complete the staff pick details");
      return;
    }
    if (step === 2 && data.isNewArrival && !data.arrivalDate) {
      toast.error("Please select the arrival date");
      return;
    }
    if (step === 2 && data.isDailyFeatured && !data.featuredNote.trim()) {
      toast.error("Please add a featured note");
      return;
    }

    if (step === 0 && !data.retailerId) {
      try {
        const result = await createRetailer();
        setData((current) => ({
          ...current,
          retailerId: result.data?._id || "",
        }));
        toast.success(result.message || "Business information saved");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not save business information",
        );
        return;
      }
    }

    if (step === 1 && !data.humidorId) {
      try {
        const result = await createHumidor();
        setData((current) => ({
          ...current,
          humidorId: result.data?._id || "",
        }));
        toast.success(result.message || "Humidor saved successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not save humidor",
        );
        return;
      }
    }

    if (step === 2 && !data.inventoryId) {
      try {
        const result = await createInventory();
        setData((current) => ({
          ...current,
          inventoryId: result.data?._id || "",
        }));
        toast.success(result.message || "Inventory saved successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not save inventory",
        );
        return;
      }
    }

    // Use the step captured by this submit. If the same submit fires twice,
    // both calls resolve to the same next step instead of skipping one.
    hasUserNavigated.current = true;
    setStep(Math.min(step + 1, steps.length - 1));
  };

  const goBack = () => {
    hasUserNavigated.current = true;
    if (step === 0) {
      router.back();
      return;
    }
    setStep((current) => Math.max(current - 1, 0));
  };

  const skipOptionalStep = () => {
    if (step !== 1 && step !== 2) return;

    hasUserNavigated.current = true;
    toast.info(
      step === 1
        ? "Humidor setup skipped. You can add one from the dashboard later."
        : "Inventory setup skipped. You can add products from the dashboard later.",
    );
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const goToCompletedStep = (targetStep: number) => {
    if (targetStep > step) return;
    hasUserNavigated.current = true;
    setStep(targetStep);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (step < steps.length - 1) {
      void next();
      return;
    }
    localStorage.removeItem("humidor411-onboarding");
    toast.success("Your Humidor411 workspace is ready!");
    router.replace("/retailer-dashboard");
  };

  const CurrentIcon = steps[step].icon;
  return (
    <main className="relative isolate flex h-screen h-dvh flex-col overflow-hidden text-white">
      <Image
        src="/assets/images/auth_bg.png"
        alt="Premium cigar lounge"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-black/55" />

      <header className="h-[72px] shrink-0 border-b border-[#CBA24A]/30 bg-[#130f09]/90 backdrop-blur-md">
        <div className="container flex h-full items-center justify-between">
          <Link href="/" aria-label="Go to home" className="flex items-center gap-2">
            <Image
              src="/assets/images/logo.png"
              alt="Humidor411"
              width={54}
              height={54}
              priority
              className="h-[54px] w-[54px] object-contain"
            />
            <span className="hidden font-playfair text-xl font-semibold text-[#D5AB48] sm:block">
              Humidor411
            </span>
          </Link>
          <div className="text-xs text-[#B7A887] sm:text-sm">
            Onboarding · Step {step + 1} of {steps.length}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-[#CBA24A]/20 bg-[#130f09]/45 pb-3 pt-4 backdrop-blur-sm sm:pb-4 sm:pt-5">
          <div className="container">
            <div className="mx-auto h-1.5 max-w-[1100px] overflow-hidden rounded-full bg-[#3B2D16]/80">
              <div
                className="h-full rounded-full bg-[#D5AB48] transition-all duration-300"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>

            <nav aria-label="Onboarding progress" className="mx-auto mt-4 flex max-w-[1000px] items-start overflow-x-auto pb-1 sm:mt-6">
              {steps.map((item, index) => {
                const Icon = item.icon;
                const active = index === step;
                const complete = index < step;
                return (
                  <div key={item.title} className="flex min-w-0 flex-1 items-start">
                    <button
                      type="button"
                      onClick={() => goToCompletedStep(index)}
                      aria-current={active ? "step" : undefined}
                      aria-label={`${item.title}${complete ? ", completed" : active ? ", current step" : ""}`}
                      className="flex min-w-[58px] flex-col items-center sm:min-w-[92px]"
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                          active
                            ? "border-[#D5AB48] bg-[#241A0C]/80 text-[#D5AB48]"
                            : complete
                              ? "border-[#D5AB48] bg-[#D5AB48] text-[#241A0C]"
                              : "border-[#6f5528] bg-[#3B2D16]/80 text-[#B7A887]"
                        }`}
                      >
                        {complete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </span>
                      <span className={`mt-2 hidden text-center text-xs sm:block ${active ? "text-[#F5E7C2]" : "text-[#B7A887]"}`}>
                        {item.title}
                      </span>
                    </button>
                    {index < steps.length - 1 ? (
                      <span className="mt-5 h-px min-w-4 flex-1 bg-[#CBA24A]/30" />
                    ) : null}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 [scrollbar-color:#8B6A32_transparent] sm:px-10 sm:py-8">
          <form
            onSubmit={submit}
            className="mx-auto w-full max-w-[672px] rounded-[14px] border border-[#CBA24A] bg-[rgba(19,15,9,0.84)] px-5 py-7 shadow-[0_16px_50px_rgba(0,0,0,0.55)] backdrop-blur-[7px] sm:px-10 sm:py-9"
          >
          <div className="flex items-center gap-4">
            <CurrentIcon className="h-8 w-8 text-[#D5AB48]" />
            <div>
              <h1 className="font-playfair text-2xl font-semibold text-[#D5AB48] sm:text-[28px]">{steps[step].title}</h1>
              <p className="text-sm text-[#B7A887]">
                {step === 0
                  ? "Tell us about your shop"
                  : step === steps.length - 1
                    ? "You're all set"
                    : `Complete your ${steps[step].short.toLowerCase()} setup`}
              </p>
            </div>
          </div>

          <div className="mt-7">
            {step === 0 && (
              <BusinessInformationStep
                data={data}
                onFieldChange={updateBusinessField}
              />
            )}
            {step === 1 && (
              <FirstHumidorStep
                data={data}
                onChange={update}
                onShelfChange={updateShelf}
                onAddShelf={addShelf}
                onRemoveShelf={removeShelf}
              />
            )}
            {step === 2 && (
              <InventoryStep
                data={data}
                image={inventoryImage}
                onFieldChange={updateInventoryField}
                onImageChange={setInventoryImage}
              />
            )}
            {step === 3 && <QrCodeStep onReady={setQrReady} />}
            {step === 4 && <ReadyToLaunchStep />}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={goBack}
              className="flex h-11 items-center gap-2 rounded-md px-2 text-sm text-[#B7A887] transition hover:text-[#F5E7C2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A]"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              {(step === 1 || step === 2) && (
                <button
                  type="button"
                  onClick={skipOptionalStep}
                  disabled={isCreatingHumidor || isCreatingInventory}
                  className="h-11 rounded-md px-3 text-xs font-medium text-[#B7A887] transition hover:bg-white/[0.05] hover:text-[#F5E7C2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
                >
                  Skip for now
                </button>
              )}
              <button
                type="submit"
                disabled={isCreatingRetailer || isCreatingHumidor || isCreatingInventory}
                className="flex h-11 items-center justify-center gap-2 rounded-[7px] bg-[#D5AB48] px-5 text-sm font-semibold text-[#241A0C] transition hover:bg-[#E2BA5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5E7C2] disabled:cursor-not-allowed disabled:opacity-60 sm:px-7"
              >
                {isCreatingRetailer || isCreatingHumidor || isCreatingInventory
                  ? "Saving..."
                  : step === steps.length - 1
                    ? "Go to Dashboard"
                    : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default OnboardingContainer;
