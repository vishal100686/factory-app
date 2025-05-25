
import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { CATEGORIES_DATA, GEMINI_MODEL_TEXT } from '../constants';
import { categorizeSubmissionWithGemini } from '../services/geminiService.ts';
import VoiceInput from './VoiceInput';
import Button from './ui/Button';
import { SubmissionStatus, CategoryDetail } from '../types';

const SubmissionForm: React.FC = () => {
  const { addSubmission, currentUser, addToast } = useAppContext();
  const [category, setCategory] = useState<string>(CATEGORIES_DATA[0]?.name || '');
  const [subCategory, setSubCategory] = useState<string>(CATEGORIES_DATA[0]?.subcategories[0] || '');
  const [divisionName, setDivisionName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCategorizing, setIsCategorizing] = useState<boolean>(false);
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>(CATEGORIES_DATA[0]?.subcategories || []);

  useEffect(() => {
    const selectedCategoryDetail = CATEGORIES_DATA.find(c => c.name === category);
    if (selectedCategoryDetail) {
      setAvailableSubcategories(selectedCategoryDetail.subcategories);
      // Set subCategory to the first one if current is not in list, or if category just changed
      if (!selectedCategoryDetail.subcategories.includes(subCategory)) {
        setSubCategory(selectedCategoryDetail.subcategories[0] || '');
      }
    } else {
      setAvailableSubcategories([]);
      setSubCategory('');
    }
  }, [category, subCategory]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleAutoCategorize = useCallback(async () => {
    if (!description.trim()) {
      addToast('Please enter a description first to auto-categorize.', 'info');
      return;
    }
    setIsCategorizing(true);
    try {
      const result = await categorizeSubmissionWithGemini(description);
      const foundCategory = CATEGORIES_DATA.find(c => c.name === result.category);
      if (foundCategory) {
        setCategory(result.category);
        // Update subcategories for the new category
        setAvailableSubcategories(foundCategory.subcategories);
        // Set subcategory from Gemini if valid, otherwise first from list
        if (foundCategory.subcategories.includes(result.subcategory)) {
          setSubCategory(result.subcategory);
        } else {
          setSubCategory(foundCategory.subcategories[0] || '');
        }
        addToast('Submission auto-categorized!', 'success');
      } else {
         addToast(`AI suggested category '${result.category}' which is not in our list. Please select manually or refine description.`, 'error');
         setCategory(CATEGORIES_DATA.find(c => c.name === "Uncategorized")?.name || '');
         setSubCategory(CATEGORIES_DATA.find(c => c.name === "Uncategorized")?.subcategories[0] || '');
      }
    } catch (error) {
      addToast('AI categorization failed. Please select manually.', 'error');
      console.error('Auto-categorization error:', error);
    } finally {
      setIsCategorizing(false);
    }
  }, [description, addToast]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      addToast('You must be logged in to submit.', 'error');
      return;
    }
    if (!description.trim()) {
      addToast('Description cannot be empty.', 'error');
      return;
    }
     if (!category || !subCategory) {
      addToast('Category and Subcategory must be selected.', 'error');
      return;
    }

    // In a real app, imageFile would be uploaded to a server and imagePreview would become the URL
    // For now, we'll just use the base64 preview as if it's a URL
    await addSubmission({
      employeeId: currentUser.id,
      category,
      subCategory,
      divisionName: divisionName.trim() || undefined, // Add division name
      description,
      imageUrl: imagePreview || undefined, // Use preview as placeholder
    });

    // Reset form
    setCategory(CATEGORIES_DATA[0]?.name || '');
    setSubCategory(CATEGORIES_DATA[0]?.subcategories[0] || '');
    setDivisionName('');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-lg shadow-xl space-y-6 border border-brand-primary">
      <h2 className="text-2xl font-semibold text-brand-dark mb-6">Report an Issue / Share a Suggestion</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-sky-800 mb-1">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-sky-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
          >
            {CATEGORIES_DATA.map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="subCategory" className="block text-sm font-medium text-sky-800 mb-1">Sub-Category</label>
          <select
            id="subCategory"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full p-3 border border-sky-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
            disabled={availableSubcategories.length === 0}
          >
            {availableSubcategories.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="divisionName" className="block text-sm font-medium text-sky-800 mb-1">Division Name (Optional)</label>
        <input
          type="text"
          id="divisionName"
          value={divisionName}
          onChange={(e) => setDivisionName(e.target.value)}
          className="w-full p-3 border border-sky-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
          placeholder="e.g., Assembly Line A, Stamping Unit"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-sky-800 mb-1">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full p-3 border border-sky-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
          placeholder="Describe the issue or suggestion in detail..."
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <VoiceInput onTranscriptChange={setDescription} currentTranscript={description} />
        <Button type="button" onClick={handleAutoCategorize} isLoading={isCategorizing} variant="outline" size="md">
            {isCategorizing ? 'AI Categorizing...' : 'AI Auto-Categorize'}
        </Button>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-sky-800 mb-1">Upload Image (Optional)</label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full text-sm text-sky-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-blue-700"
        />
        {imagePreview && (
          <div className="mt-4">
            <img src={imagePreview} alt="Preview" className="max-h-48 rounded-md shadow"/>
            <Button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} variant="danger" size="sm" className="mt-2">
              Remove Image
            </Button>
          </div>
        )}
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto" isLoading={isCategorizing}>
        Submit Report/Suggestion
      </Button>
    </form>
  );
};

export default SubmissionForm;