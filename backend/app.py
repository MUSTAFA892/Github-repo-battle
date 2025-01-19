from flask import Flask, request, jsonify
from flask_cors import CORS  # Import flask-cors
import google.generativeai as genai
import os

# Initialize Flask app
app = Flask(__name__)

# Enable CORS (adjust the origins if needed)
CORS(app, origins=["https://github-repo-battle-omega.vercel.app/"])  # This allows only localhost:3000 for requests

# Ensure the API key is set in the environment or directly in the code securely
api_key = os.getenv("GEMINI_API_KEY", "AIzaSyDHKfIPCO7tTe4R75zRPA3pRRGRyksJzVg")  # Best practice to load from environment variables

if not api_key:
    raise EnvironmentError("GEMINI_API_KEY environment variable is not set.")

# Configure the Gemini API
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash-8b")  # Initialize the model once here

@app.route('/generate', methods=['POST'])
def generate_response():
    try:
        # Get the data from the incoming request
        data = request.get_json()

        # Validate the data
        user_name_1 = data.get('userName1')
        user_data_1 = data.get('userData1')
        user_name_2 = data.get('userName2')
        user_data_2 = data.get('userData2')
        task = data.get('task')

        if not all([user_name_1, user_data_1, user_name_2, user_data_2, task]):
            return jsonify({'message': "Invalid input data"}), 400

        # Set the prompt based on the task
        if task == "legend":
            prompt = (f"You need to behave as an evaluator. There is a person named {user_name_1} "
                      f"and his GitHub profile is like this: {user_data_1}. Evaluate it against a well-known "
                      f"legend coder named: {user_name_2}, and his profile data is: {user_data_2}. "
                      "Try to criticize the user, maybe speak a few bad words too. Your response should only "
                      "include the evaluation result, nothing else. Make it fun and funny!")
        else:
            prompt = (f"You need to behave as an evaluator. There is a person named {user_name_1} "
                      f"and his GitHub profile looks like this: {user_data_1}. There is also one person named "
                      f"{user_name_2} and his profile is like this: {user_data_2}. You need to evaluate both "
                      "the user profiles. The user whose profile is not as good as the other, make a joke out of "
                      "them. Praise the other user if their profile is better."
                      """example:- response i want this types of roasting and praising accroiding to the user data:
                      

                    1. Example but dont use in the actual implementaion generate your own according to the user data : - Dude, your profile is... something. A picture of Luffy in Gear Five? Seriously? It's like you're trying to impress us with your anime knowledge, but it just screams "uninspired." Your repos all have "no readme found?" Come on, man. That's a huge red flag. A machine learning developer without readmes? You're either hiding something or you're incredibly lazy. "Passionate AI Developer from India"? Yeah, right. And your bio is just...blah. 3 followers? You're basically invisible on GitHub. At least have a decent README for your projects. Maybe try explaining what you did. Just...wow. You should probably start by getting a profile that looks professional. 🤡 Seriously, you need to clean up y1.
                    2. Example but dont use in the actual implementaion generate your own according to the user data : - Now, this is a profile that shines! Seriously, great job, username! Your README's are detailed and informative—showing that you actually care about your projects. The detailed explanations of your projects are very helpful. Your flask-cloudinary-app project is fantastic. Clear instructions, great explanations, and even screenshots—this is how you showcase your work! And those 28,000+ followers? You're a star, dude! You're killing it on YouTube and GitHub. Your comprehensive tutorials and projects are a real asset to the community. Respect! 👏 You've got the right idea, and it shows in your work. Keep the great work going! You're setting a great example for other developers. Amazing! ✨
                        
                   Give me the responses that someone sees it and die with laugh and make it very sportingly you can also go with the fun or actual dark jokes , make it fun and everytime different response according to the user data and very funny and dark jokes on it and suggesstions... keep it short but impactful.

                   syntax of the response :-
                    1.username1:- response
                    2.username2:- response
                    this is the response i want from the api according to the user data in the above example , Note :- the above example are on
                    Give me output in paragraph form first username1 and data afternew line username2 and data and with perfect alignment..
                    include this type of response in the response of the api and also use emojis
                    
                    Treat the user equally and fairly. Don't be biased. Make it fun and funny! according to the user data
                    
                    important note : only display username and data in the response stricly no other data should be displayed in the response example , dont iclude the boldness in any character you are giving ti shoukd not be bold """)
                     
                    
        # Generate the content using the Gemini model
        response = model.generate_content(prompt)

        # Extract the generated text
        generated_text = response.text

        # Return the generated response
        return jsonify({'message': generated_text}), 200

    except KeyError as e:
        return jsonify({'message': f"Key error: {str(e)}"}), 400
    except Exception as error:
        print(f"Error: {error}")
        return jsonify({'message': "Server error"}), 500

if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
