function generate_chat_response( $last_prompt, $conversation_history ) {

// OpenAI API URL and key
$api_url = 'https://api.openai.com/v1/chat/completions';
$api_key = 'sk-XXX'; // Replace with your actual API key

// Headers for the OpenAI API
$headers = [
    'Content-Type' => 'application/json',
    'Authorization' => 'Bearer ' . $api_key
];

// Add the last prompt to the conversation history
$conversation_history[] = [
    'role' => 'system',
    'content' => 'Answer questions only related to digital marketing, otherwise, say I dont know'
];

$conversation_history[] = [
    'role' => 'user',
    'content' => $last_prompt
];

// Body for the OpenAI API
$body = [
    'model' => 'gpt-3.5-turbo', // You can change the model if needed
    'messages' => $conversation_history,
    'temperature' => 0.7 // You can adjust this value based on desired creativity
];

// Args for the WordPress HTTP API
$args = [
    'method' => 'POST',
    'headers' => $headers,
    'body' => json_encode($body),
    'timeout' => 120
];

// Send the request
$response = wp_remote_request($api_url, $args);

// Handle the response
if (is_wp_error($response)) {
    return $response->get_error_message();
} else {
    $response_body = wp_remote_retrieve_body($response);
    $data = json_decode($response_body, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        return [
            'success' => false,
            'message' => 'Invalid JSON in API response',
            'result' => ''
        ];
    } elseif (!isset($data['choices'])) {
        return [
            'success' => false,
            'message' => 'API request failed. Response: ' . $response_body,
            'result' => ''
        ];
    } else {
        $content = $data['choices'][0]['message']['content'];
        return [
            'success' => true,
            'message' => 'Response Generated',
            'result' => $content
        ];
    }
}
}

function generate_dummy_response( $last_prompt, $conversation_history ) {
// Dummy static response
$dummy_response = array(
    'success' => true,
    'message' => 'done',
    'result' => "here is my reply"
);

// Return the dummy response as an associative array
return $dummy_response;
}

function handle_chat_bot_request( WP_REST_Request $request ) {
$last_prompt = $request->get_param('last_prompt');
$conversation_history = $request->get_param('conversation_history');

$response = generate_chat_response($last_prompt, $conversation_history);
return $response;
}

function load_chat_bot_base_configuration(WP_REST_Request $request) {
// You can retrieve user data or other dynamic information here
$user_avatar_url = "https://learnwithhasan.com/wp-content/uploads/2023/09/pngtree-businessman-user-avatar-wearing-suit-with-red-tie-png-image_5809521.png"; // Implement this function
$bot_image_url = "https://learnwithhasan.com/wp-content/uploads/2023/12/site-logo-mobile.png"; // Implement this function

$response = array(
'botStatus' => 0,
'StartUpMessage' => "Hi, How are you?",
'fontSize' => '16',
'userAvatarURL' => $user_avatar_url,
'botImageURL' => $bot_image_url,
// Adding the new field
'commonButtons' => array(
    array(
        'buttonText' => 'I want your help!!!',
        'buttonPrompt' => 'I have a question about your courses'
    ),
    array(
        'buttonText' => 'I want a Discount',
        'buttonPrompt' => 'I want a discount'
    )

)

);

$response = new WP_REST_Response($response, 200);

return $response;
}

add_action( 'rest_api_init', function () {
register_rest_route( 'myapi/v1', '/chat-bot/', array(
   'methods' => 'POST',
   'callback' => 'handle_chat_bot_request',
   'permission_callback' => '__return_true'
) );

register_rest_route('myapi/v1', '/chat-bot-config', array(
    'methods' => 'GET',
    'callback' => 'load_chat_bot_base_configuration',
));
} );
