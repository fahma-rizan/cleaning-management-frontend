import { useState } from 'react';
import { Calculator, Home, Maximize, Users, Sparkles, ArrowRight } from 'lucide-react';

interface AIEstimatorProps {
  onEstimateComplete?: (price: number, details: any) => void;
}

export default function AIEstimator({ onEstimateComplete }: AIEstimatorProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyType: '',
    squareFeet: '',
    rooms: 2,
    bathrooms: 1,
    cleaningLevel: '',
    hasKitchen: true,
    hasPets: false,
    lastCleaned: '',
  });
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [estimateBreakdown, setEstimateBreakdown] = useState<any>(null);

  const calculateEstimate = () => {
    // AI-based price estimation logic
    let basePrice = 2000;

    // Property type multiplier
    if (formData.propertyType === 'apartment') basePrice *= 0.8;
    else if (formData.propertyType === 'house') basePrice *= 1.0;
    else if (formData.propertyType === 'villa') basePrice *= 1.5;
    else if (formData.propertyType === 'office') basePrice *= 1.3;

    // Square feet pricing
    const sqft = parseInt(formData.squareFeet) || 1000;
    const sqftFactor = sqft / 1000;
    basePrice *= sqftFactor;

    // Room and bathroom count
    const roomExtra = Math.max(0, formData.rooms - 2) * 500;
    const bathroomExtra = Math.max(0, formData.bathrooms - 1) * 300;

    // Cleaning level
    let cleaningMultiplier = 1;
    if (formData.cleaningLevel === 'basic') cleaningMultiplier = 0.8;
    else if (formData.cleaningLevel === 'deep') cleaningMultiplier = 1.5;
    else if (formData.cleaningLevel === 'move-in-out') cleaningMultiplier = 2;

    basePrice *= cleaningMultiplier;

    // Additional factors
    const kitchenExtra = formData.hasKitchen ? 800 : 0;
    const petExtra = formData.hasPets ? 500 : 0;

    // Time since last cleaned (affects difficulty)
    let timeMultiplier = 1;
    if (formData.lastCleaned === 'over-6-months') timeMultiplier = 1.3;
    else if (formData.lastCleaned === '3-6-months') timeMultiplier = 1.15;
    else if (formData.lastCleaned === 'never') timeMultiplier = 1.5;

    const subtotal = (basePrice + roomExtra + bathroomExtra + kitchenExtra + petExtra) * timeMultiplier;
    const final = Math.round(subtotal);

    const breakdown = {
      basePrice: Math.round(basePrice),
      roomExtra,
      bathroomExtra,
      kitchenExtra,
      petExtra,
      timeMultiplier,
      subtotal: Math.round(subtotal),
      estimatedDuration: Math.round((sqft / 500) * cleaningMultiplier * 2) / 2,
    };

    setEstimatedPrice(final);
    setEstimateBreakdown(breakdown);
    if (onEstimateComplete) {
      onEstimateComplete(final, breakdown);
    }
  };

  const handleNext = () => {
    if (step === 3) {
      calculateEstimate();
    } else {
      setStep(step + 1);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-lg mb-3">What type of property needs cleaning?</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'apartment', name: 'Apartment', icon: Home },
            { id: 'house', name: 'House', icon: Home },
            { id: 'villa', name: 'Villa', icon: Home },
            { id: 'office', name: 'Office', icon: Home },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setFormData({ ...formData, propertyType: type.id })}
              className={`p-6 rounded-xl border-2 transition-all ${
                formData.propertyType === type.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <type.icon className="w-8 h-8 mx-auto mb-2" />
              <div className="text-lg">{type.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-lg mb-3">Approximate size (square feet)</label>
        <div className="relative">
          <Maximize className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="number"
            value={formData.squareFeet}
            onChange={(e) => setFormData({ ...formData, squareFeet: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="e.g., 1500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-lg mb-3">Number of rooms to clean</label>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, rooms: Math.max(1, formData.rooms - 1) })}
            className="w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center"
          >
            -
          </button>
          <div className="text-4xl w-20 text-center">{formData.rooms}</div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, rooms: formData.rooms + 1 })}
            className="w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="block text-lg mb-3">Number of bathrooms</label>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, bathrooms: Math.max(1, formData.bathrooms - 1) })}
            className="w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center"
          >
            -
          </button>
          <div className="text-4xl w-20 text-center">{formData.bathrooms}</div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, bathrooms: formData.bathrooms + 1 })}
            className="w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="block text-lg mb-3">Additional areas</label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.hasKitchen}
              onChange={(e) => setFormData({ ...formData, hasKitchen: e.target.checked })}
              className="w-5 h-5"
            />
            <span>Kitchen (+ LKR 800)</span>
          </label>
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.hasPets}
              onChange={(e) => setFormData({ ...formData, hasPets: e.target.checked })}
              className="w-5 h-5"
            />
            <span>Pet-friendly cleaning (+ LKR 500)</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-lg mb-3">What level of cleaning do you need?</label>
        <div className="space-y-3">
          {[
            { id: 'basic', name: 'Basic Cleaning', desc: 'Regular dusting and mopping' },
            { id: 'standard', name: 'Standard Cleaning', desc: 'Thorough cleaning of all areas' },
            { id: 'deep', name: 'Deep Cleaning', desc: 'Intensive cleaning including hard-to-reach areas' },
            { id: 'move-in-out', name: 'Move-In/Out', desc: 'Complete property cleaning' },
          ].map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => setFormData({ ...formData, cleaningLevel: level.id })}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                formData.cleaningLevel === level.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-lg mb-1">{level.name}</div>
              <div className="text-sm text-gray-600">{level.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-lg mb-3">When was the last professional cleaning?</label>
        <select
          value={formData.lastCleaned}
          onChange={(e) => setFormData({ ...formData, lastCleaned: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">Select...</option>
          <option value="recently">Less than 1 month ago</option>
          <option value="1-3-months">1-3 months ago</option>
          <option value="3-6-months">3-6 months ago</option>
          <option value="over-6-months">Over 6 months ago</option>
          <option value="never">Never / Don't know</option>
        </select>
      </div>
    </div>
  );

  const renderEstimate = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-3xl mb-2">Estimated Price</h2>
        <div className="text-5xl text-blue-600 mb-4">LKR {estimatedPrice?.toLocaleString()}</div>
        <p className="text-gray-600">Estimated duration: {estimateBreakdown?.estimatedDuration} hours</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl mb-4">Price Breakdown</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Base price</span>
            <span>LKR {estimateBreakdown?.basePrice.toLocaleString()}</span>
          </div>
          {estimateBreakdown?.roomExtra > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Extra rooms</span>
              <span>+ LKR {estimateBreakdown?.roomExtra.toLocaleString()}</span>
            </div>
          )}
          {estimateBreakdown?.bathroomExtra > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Extra bathrooms</span>
              <span>+ LKR {estimateBreakdown?.bathroomExtra.toLocaleString()}</span>
            </div>
          )}
          {estimateBreakdown?.kitchenExtra > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Kitchen cleaning</span>
              <span>+ LKR {estimateBreakdown?.kitchenExtra.toLocaleString()}</span>
            </div>
          )}
          {estimateBreakdown?.petExtra > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Pet-friendly cleaning</span>
              <span>+ LKR {estimateBreakdown?.petExtra.toLocaleString()}</span>
            </div>
          )}
          {estimateBreakdown?.timeMultiplier > 1 && (
            <div className="flex justify-between text-orange-600">
              <span>Intensive cleaning factor</span>
              <span>×{estimateBreakdown?.timeMultiplier}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2 flex justify-between">
            <span>Total Estimate</span>
            <span>LKR {estimatedPrice?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p>💡 This is an AI-generated estimate. Final price may vary based on actual inspection and specific requirements.</p>
      </div>
    </div>
  );

  const isStepValid = () => {
    if (step === 1) return formData.propertyType && formData.squareFeet;
    if (step === 2) return true;
    if (step === 3) return formData.cleaningLevel && formData.lastCleaned;
    return true;
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl">AI Price Estimator</h2>
          <p className="text-gray-600">Get an instant price estimate</p>
        </div>
      </div>

      {/* Progress Bar */}
      {estimatedPrice === null && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">Step {step} of 3</div>
        </div>
      )}

      {/* Step Content */}
      {estimatedPrice === null ? (
        <>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300 flex items-center justify-center gap-2"
            >
              {step === 3 ? 'Calculate Price' : 'Next'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </>
      ) : (
        <>
          {renderEstimate()}
          <button
            type="button"
            onClick={() => {
              setEstimatedPrice(null);
              setStep(1);
            }}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors mt-4"
          >
            Start New Estimate
          </button>
        </>
      )}
    </div>
  );
}