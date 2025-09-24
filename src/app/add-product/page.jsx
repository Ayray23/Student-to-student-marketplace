"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, MapPin, Tag, DollarSign, X } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createClient } from "/src/utils/supabase/client.ts";

export default function AddProduct() {
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    condition: "new",
    location: "",
    city: "",
    phone: "",
    email: "",
    seller: "",
  });

  const [images, setImages] = useState([]);

  // ✅ categories + location data
  const categories = {
    electronics: ["Mobile Phones", "Laptops", "TVs", "Audio", "Gaming"],
    fashion: ["Men's Clothing", "Women's Clothing", "Shoes", "Bags", "Watches"],
    vehicles: ["Cars", "Motorcycles", "Buses", "Trucks", "Parts"],
    home: ["Furniture", "Appliances", "Decor", "Garden", "Tools"],
    services: ["Cleaning", "Repair", "Tutoring", "Beauty", "Events"],
    property: ["Houses", "Apartments", "Land", "Commercial", "Short Let"],
  };

  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
    "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
    "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
  ];

  const stateCities = { "Lagos": ["Ikeja", "Victoria Island", "Lekki", "Surulere", "Yaba", "Ikorodu", "Alimosho", "Agege", "Mushin", "Oshodi"],
   "Abuja": ["Central Area", "Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa", "Kubwa", "Nyanya", "Karu", "Lugbe"],
    "Kano": ["Kano Municipal", "Fagge", "Dala", "Gwale", "Tarauni", "Nassarawa", "Ungogo", "Kumbotso"],
     "Rivers": ["Port Harcourt", "Obio-Akpor", "Okrika", "Ogu–Bolo", "Eleme", "Tai", "Gokana", "Khana"], 
     "Oyo": ["Ibadan North", "Ibadan South-West", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Egbeda", "Akinyele", "Lagelu"],
      "Kaduna": ["Kaduna North", "Kaduna South", "Chikun", "Igabi", "Ikara", "Jaba", "Jema'a", "Kachia"],
       "Katsina": ["Katsina", "Daura", "Funtua", "Malumfashi", "Bakori", "Batagarawa", "Baure", "Bindawa"],
        "Ogun": ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu Ode"],
         "Anambra": ["Awka North", "Awka South", "Anambra East", "Anambra West", "Anaocha", "Ayamelum", "Dunukofia", "Ekwusigo"],
          "Imo": ["Owerri Municipal", "Owerri North", "Owerri West", "Aboh Mbaise", "Ahiazu Mbaise", "Ehime Mbano", "Ezinihitte", "Ideato North"],
           "Enugu": ["Enugu East", "Enugu North", "Enugu South", "Aninri", "Awgu", "Ezeagu", "Igbo Etiti", "Igbo Eze North"],
            "Akwa Ibom": ["Uyo", "Ikot Ekpene", "Eket", "Oron", "Abak", "Eastern Obolo", "Essien Udim", "Etim Ekpo"],
             "Abia": ["Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North", "Isiala Ngwa South", "Isuikwuato"],
              "Bayelsa": ["Yenagoa", "Kolokuma/Opokuma", "Sagbama", "Brass", "Ekeremor", "Nembe", "Ogbia", "Southern Ijaw"],
               "Cross River": ["Calabar Municipal", "Calabar South", "Akamkpa", "Akpabuyo", "Bakassi", "Bekwarra", "Biase", "Boki"],
                "Delta": ["Warri North", "Warri South", "Warri South West", "Aniocha North", "Aniocha South", "Bomadi", "Burutu", "Ethiope East"],
                 "Edo": ["Benin City", "Egor", "Ikpoba Okha", "Oredo", "Akoko-Edo", "Esan Central", "Esan North-East", "Esan South-East"], 
                 "Ekiti": ["Ado Ekiti", "Efon", "Ekiti East", "Ekiti South-West", "Ekiti West", "Emure", "Gbonyin", "Ido Osi"],
                  "Gombe": ["Gombe", "Akko", "Balanga", "Billiri", "Dukku", "Funakaye", "Kaltungo", "Kwami"],
                   "Jigawa": ["Dutse", "Buji", "Garki", "Gumel", "Guri", "Gwaram", "Gwiwa", "Hadejia"],
                    "Kebbi": ["Birnin Kebbi", "Aleiro", "Arewa Dandi", "Argungu", "Augie", "Bagudo", "Bunza", "Dandi"],
                    "Kogi": ["Lokoja", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", "Igalamela Odolu"],
                    "Kwara": ["Ilorin East", "Ilorin South", "Ilorin West", "Asa", "Baruten", "Edu", "Ekiti", "Ifelodun"],
                    "Nasarawa": ["Lafia", "Akwanga", "Awe", "Doma", "Karu", "Keana", "Keffi", "Kokona"],
                    "Niger": ["Minna", "Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati"], 
                    "Ondo": ["Akure North", "Akure South", "Akoko North-East", "Akoko North-West", "Akoko South-West", "Akoko South-East", "Ese Odo", "Idanre"],
                      "Osun": ["Osogbo", "Aiyedaade", "Aiyedire", "Atakumosa East", "Atakumosa West", "Boluwaduro", "Boripe","Ede North"], 
                        "Plateau": ["Jos North", "Jos South", "Jos East", "Barkin Ladi", "Bassa", "Bokkos", "Kanam", "Kanke"],
                          "Sokoto": ["Sokoto North", "Sokoto South", "Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu"],
                            "Taraba": ["Jalingo", "Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Karim Lamido"],
                              "Yobe": ["Damaturu", "Fika", "Fune", "Geidam", "Gujba", "Gulani", "Gulani", "Jakusko", "Karasuwa"],
                                "Zamfara": ["Gusau", "Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkuyum", "Bungudu", "Gummi", "Kaura Namoda"],
                                "Benue": ["Makurdi", "Ado", "Agatu", "Apa", "Buruku", "Gboko", "Guma", "Gwer East"],
                                  "Borno": ["Maiduguri", "Jere", "Konduga", "Mafa", "Magumeri", "Marte", "Mobbar", "Monguno"], 
                                    "Ebonyi": ["Abakaliki", "Afikpo North", "Afikpo South", "Ebonyi", "Ezza North", "Ezza South", "Ikwo", "Ishielu"],
                                      "Adamawa": ["Yola North", "Yola South", "Fufure", "Ganye", "Gayuk", "Gombi", "Grie", "Hong"], 
                                          "Bauchi": ["Bauchi", "Alkaleri", "Bogoro", "Damban", "Darazo", "Dass", "Gamawa", "Ganjuwa"]
   };


  // ✅ Handle drag + drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (images.length + files.length > 10) {
      toast.error("You can only upload up to 10 images.");
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleImageChange = (e) => {
    const filesArray = e.target.files ? Array.from(e.target.files) : [];
    if (images.length + filesArray.length > 10) {
      toast.error("You can only upload up to 10 images.");
      return;
    }
    setImages((prev) => [...prev, ...filesArray]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let uploadedUrls = [];

      // ✅ upload images to Supabase
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split(".").pop();
        const uniqueName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(uniqueName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("product-images").getPublicUrl(uniqueName);
        uploadedUrls.push(data.publicUrl);
      }

      // ✅ ensure logged-in user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        toast.error("You must be logged in to post a product");
        return;
      }

      // ✅ insert into DB
      const { error } = await supabase.from("products").insert([
        {
          ...formData,
          seller_id: userData.user.id,
          images: uploadedUrls,
        },
      ]);

      if (error) {
        console.error("Supabase Insert Error:", error);
        toast.error(error.message);
        return;
      }

      toast.success("✅ Product Listed Successfully!");

      // reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
        subcategory: "",
        condition: "new",
        location: "",
        city: "",
        phone: "",
        email: "",
        seller: "",
      });
      setImages([]);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to publish product.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Add Your Product
            </h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Info */}
          <Card className="shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Tag className="h-6 w-6 text-pink-600" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-lg">Product Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter product title (e.g., iPhone 13 Pro Max)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-lg py-3"
                  required
                />
              </div>

              {/* category + subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-lg">Category *</Label>
                  <Select
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value, subcategory: "" })
                    }
                  >
                    <SelectTrigger className="text-lg py-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(categories).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.category && (
                  <div className="space-y-2">
                    <Label className="text-lg">Subcategory *</Label>
                    <Select
                      onValueChange={(value) =>
                        setFormData({ ...formData, subcategory: value })
                      }
                    >
                      <SelectTrigger className="text-lg py-3">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories[formData.category]?.map((subcat) => (
                          <SelectItem key={subcat} value={subcat}>
                            {subcat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* description */}
              <div className="space-y-2">
                <Label className="text-lg">Description *</Label>
                <Textarea
                  placeholder="Describe your product..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={6}
                  className="text-lg"
                  required
                />
              </div>

              {/* price + condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" /> Price (₦) *
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="text-lg py-3"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-lg">Condition *</Label>
                  <RadioGroup
                    value={formData.condition}
                    onValueChange={(value) =>
                      setFormData({ ...formData, condition: value })
                    }
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="new" />
                      <Label htmlFor="new">New</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="used" id="used" />
                      <Label htmlFor="used">Used</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="fileInput"
              />

              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById("fileInput")?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Drag & Drop or Click to Upload</p>
                <p className="text-muted-foreground mb-4">
                  Add up to 10 photos. First photo will be the cover image.
                </p>
                <Button variant="outline" type="button">
                  Choose Files
                </Button>
              </div>

              {images.length > 0 && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${idx}`}
                        className={`w-full h-32 object-cover rounded-lg shadow ${
                          idx === 0 ? "ring-4 ring-pink-500" : ""
                        }`}
                      />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-pink-600 text-white text-xs px-2 py-0.5 rounded">
                          Cover
                        </span>
                      )}
                      {/* ❌ Cancel button always visible now */}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 shadow-lg"
                      >
                        <X size={14} />
                      </button>

                      <p className="text-xs text-center mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location & Contact */}
          <Card className="shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <MapPin className="h-6 w-6 text-pink-600" />
                Location & Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-lg">State *</Label>
                  <Select
                    onValueChange={(value) =>
                      setFormData({ ...formData, location: value, city: "" })
                    }
                  >
                    <SelectTrigger className="text-lg py-3">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.location && (
                  <div className="space-y-2">
                    <Label className="text-lg">City/LGA *</Label>
                    <Select
                      onValueChange={(value) =>
                        setFormData({ ...formData, city: value })
                      }
                    >
                      <SelectTrigger className="text-lg py-3">
                        <SelectValue placeholder="Select city/LGA" />
                      </SelectTrigger>
                      <SelectContent>
                        {stateCities[formData.location]?.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-lg">Phone Number *</Label>
                  <Input
                    type="tel"
                    placeholder="+234 xxx xxx xxxx"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="text-lg py-3"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-lg">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="text-lg py-3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-lg">Seller Name *</Label>
                <Input
                  type="text"
                  placeholder="Enter seller name"
                  value={formData.seller}
                  onChange={(e) =>
                    setFormData({ ...formData, seller: e.target.value })
                  }
                  className="text-lg py-3"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <Button variant="outline" type="button">
              Save as Draft
            </Button>
            <Button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 text-lg shadow"
            >
              Publish Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
