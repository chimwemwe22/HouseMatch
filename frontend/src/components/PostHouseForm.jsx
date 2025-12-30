import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const PostHouseForm = () => {
  const { user, accessToken} = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    furnished: false,
  });

  const [images, setImages] = useState([]);

  const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    };

    const handleImageChange = (e) => {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);
    };

    const removeImage = (index) => {
      setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    const submission = new FormData();

    Object.keys(formData).forEach((key) => {
      let value = formData[key];
      if (["price", "bedrooms", "bathrooms"].includes(key)) {
        value = parseInt(value, 10);
      }
      if (key === "furnished") {
        value = value ? "true" : "false";
      }
      submission.append(key, value);
    });

    if (user?.id) {
      submission.append("landlord", user.id);
    }

    images.forEach((img) => submission.append("images", img));

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/api/listings/create/", {
        method: "POST",
        body: submission,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        alert("House submitted successfully! Pending approval.");
        setFormData({
          title: "",
          description: "",
          price: "",
          location: "",
          bedrooms: "",
          bathrooms: "",
          furnished: false,
        });
        setImages([]);
      } else {
        const errorData = await res.json();
        console.error("Submit failed:", errorData);
        alert("Something went wrong submitting your listing.");
      }
    } catch (error) {
      console.error("Error submitting house:", error);
    }
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white shadow rounded mt-8"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Post a New House</h2>

      {/* Form inputs */}
      <input type="text" name="title" placeholder="Title" required onChange={handleChange} value={formData.title} className="w-full mb-3 p-2 border rounded" />
      <textarea name="description" placeholder="Description" required onChange={handleChange} value={formData.description} className="w-full mb-3 p-2 border rounded" />
      <input type="number" name="price" placeholder="Price" required onChange={handleChange} value={formData.price} className="w-full mb-3 p-2 border rounded" />
      <input type="text" name="location" placeholder="Location" required onChange={handleChange} value={formData.location} className="w-full mb-3 p-2 border rounded" />
      <input type="number" name="bedrooms" placeholder="Bedrooms" required onChange={handleChange} value={formData.bedrooms} className="w-full mb-3 p-2 border rounded" />
      <input type="number" name="bathrooms" placeholder="Bathrooms" required onChange={handleChange} value={formData.bathrooms} className="w-full mb-3 p-2 border rounded" />

      <div className="mb-3 flex items-center gap-2">
        <input type="checkbox" name="furnished" checked={formData.furnished} onChange={handleChange} />
        <label>Furnished</label>
      </div>

      <input type="file" name="images" accept="image/*" multiple onChange={handleImageChange} className="w-full mb-3" />

      {/* Image previews */}
      <div className="flex gap-3 mb-3 overflow-x-auto py-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative flex-shrink-0 w-24 h-24 border rounded overflow-hidden">
            <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
            <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm shadow">×</button>
          </div>
        ))}
      </div>

      <button type="submit" className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 w-full">Submit Listing</button>
    </form>
  );
};

export default PostHouseForm;
