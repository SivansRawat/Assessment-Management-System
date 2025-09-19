const assessmentConfig = {
  "as_hr_02": {
    "name": "Health & Fitness Assessment",
    "sections": [
      {
        "id": "overview",
        "title": "Assessment Overview",
        "enabled": true,
        "fields": [
          {
            "label": "Overall Health Score",
            "jsonPath": "$.accuracy",
            "format": "percentage",
            "unit": "%"
          },
          {
            "label": "Assessment Type",
            "jsonPath": "$.assessment_id",
            "format": "string"
          },
          {
            "label": "Time Elapsed",
            "jsonPath": "$.timeElapsed",
            "format": "time",
            "unit": "seconds"
          }
        ]
      },
      {
        "id": "vitals",
        "title": "Key Body Vitals",
        "enabled": true,
        "fields": [
          {
            "label": "Heart Rate",
            "jsonPath": "$.vitalsMap.vitals.heart_rate",
            "format": "number",
            "unit": "bpm",
            "classification": {
              "ranges": [
                {
                  "min": 0,
                  "max": 60,
                  "label": "Low",
                  "color": "blue"
                },
                {
                  "min": 60,
                  "max": 100,
                  "label": "Normal",
                  "color": "green"
                },
                {
                  "min": 100,
                  "max": 200,
                  "label": "High",
                  "color": "red"
                }
              ]
            }
          },
          {
            "label": "Blood Pressure (Systolic)",
            "jsonPath": "$.vitalsMap.vitals.bp_sys",
            "format": "number",
            "unit": "mmHg",
            "classification": {
              "ranges": [
                {
                  "min": 0,
                  "max": 90,
                  "label": "Low",
                  "color": "blue"
                },
                {
                  "min": 90,
                  "max": 120,
                  "label": "Normal",
                  "color": "green"
                },
                {
                  "min": 120,
                  "max": 140,
                  "label": "Elevated",
                  "color": "yellow"
                },
                {
                  "min": 140,
                  "max": 300,
                  "label": "High",
                  "color": "red"
                }
              ]
            }
          },
          {
            "label": "Blood Pressure (Diastolic)",
            "jsonPath": "$.vitalsMap.vitals.bp_dia",
            "format": "number",
            "unit": "mmHg"
          },
          {
            "label": "Oxygen Saturation",
            "jsonPath": "$.vitalsMap.vitals.oxy_sat_prcnt",
            "format": "percentage",
            "unit": "%"
          }
        ]
      },
      {
        "id": "heart_health",
        "title": "Heart Health",
        "enabled": true,
        "fields": [
          {
            "label": "Health Risk Score",
            "jsonPath": "$.vitalsMap.health_risk_score",
            "format": "number",
            "classification": {
              "ranges": [
                {
                  "min": 0,
                  "max": 20,
                  "label": "Low Risk",
                  "color": "green"
                },
                {
                  "min": 20,
                  "max": 50,
                  "label": "Moderate Risk",
                  "color": "yellow"
                },
                {
                  "min": 50,
                  "max": 100,
                  "label": "High Risk",
                  "color": "red"
                }
              ]
            }
          },
          {
            "label": "Wellness Score",
            "jsonPath": "$.vitalsMap.wellness_score",
            "format": "number",
            "classification": {
              "ranges": [
                {
                  "min": 0,
                  "max": 50,
                  "label": "Poor",
                  "color": "red"
                },
                {
                  "min": 50,
                  "max": 75,
                  "label": "Fair",
                  "color": "yellow"
                },
                {
                  "min": 75,
                  "max": 100,
                  "label": "Good",
                  "color": "green"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "body_composition",
        "title": "Body Composition",
        "enabled": true,
        "fields": [
          {
            "label": "BMI",
            "jsonPath": "$.bodyCompositionData.BMI",
            "format": "decimal",
            "classification": {
              "ranges": [
                {
                  "min": 0,
                  "max": 18.5,
                  "label": "Underweight",
                  "color": "blue"
                },
                {
                  "min": 18.5,
                  "max": 25,
                  "label": "Normal",
                  "color": "green"
                },
                {
                  "min": 25,
                  "max": 30,
                  "label": "Overweight",
                  "color": "yellow"
                },
                {
                  "min": 30,
                  "max": 100,
                  "label": "Obese",
                  "color": "red"
                }
              ]
            }
          },
          {
            "label": "Body Fat Percentage",
            "jsonPath": "$.bodyCompositionData.BFC",
            "format": "decimal",
            "unit": "%"
          }
        ]
      }
    ]
  },
  "as_card_01": {
    "name": "Cardiac Assessment",
    "sections": [
      {
        "id": "overview",
        "title": "Assessment Overview",
        "enabled": true,
        "fields": [
          {
            "label": "Overall Health Score",
            "jsonPath": "$.accuracy",
            "format": "percentage",
            "unit": "%"
          }
        ]
      },
      {
        "id": "vitals",
        "title": "Key Body Vitals",
        "enabled": true,
        "fields": [
          {
            "label": "Heart Rate",
            "jsonPath": "$.vitalsMap.vitals.heart_rate",
            "format": "number",
            "unit": "bpm"
          }
        ]
      },
      {
        "id": "cardiovascular_endurance",
        "title": "Cardiovascular Endurance",
        "enabled": true,
        "fields": [
          {
            "label": "Endurance Time",
            "jsonPath": "$.exercises[?(@.id==235)].setList[0].time",
            "format": "number",
            "unit": "seconds"
          }
        ]
      }
    ]
  }
};

module.exports = assessmentConfig;
