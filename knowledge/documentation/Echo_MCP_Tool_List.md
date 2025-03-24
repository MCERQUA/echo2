# Echo MCP Tool List
**Last Updated: March 24, 2025**

This document provides a comprehensive list of all Model Context Protocol (MCP) tools available to Echo, organized by server and functionality.

## Memory Knowledge Server (memory-knowledge)
- **add_observations**: Add new observations to existing entities
- **create_entities**: Create multiple new entities in the knowledge graph
- **create_relations**: Create multiple new relations between entities
- **delete_entities**: Remove entities and their relations
- **delete_observations**: Remove specific observations from entities
- **delete_relations**: Remove specific relations from the graph
- **open_nodes**: Retrieve specific nodes by name
- **read_graph**: Read the entire knowledge graph
- **search_nodes**: Search for nodes based on query

## GitHub Tools (github-tools)
- **add_issue_comment**: Add a comment to an existing issue
- **create_branch**: Create a new branch in a GitHub repository
- **create_issue**: Create a new issue in a GitHub repository
- **create_or_update_file**: Create or update a single file in a GitHub repository
- **create_pull_request**: Create a new pull request in a GitHub repository
- **create_repository**: Create a new GitHub repository in your account
- **fork_repository**: Fork a GitHub repository to your account or specified organization
- **get_file_contents**: Get the contents of a file or directory from a GitHub repository
- **get_issue**: Get details of a specific issue in a GitHub repository
- **list_commits**: Get list of commits of a branch in a GitHub repository
- **list_issues**: List issues in a GitHub repository with filtering options
- **push_files**: Push multiple files to a GitHub repository in a single commit
- **search_code**: Search for code across GitHub repositories
- **search_issues**: Search for issues and pull requests across GitHub repositories
- **search_repositories**: Search for GitHub repositories
- **search_users**: Search for users on GitHub
- **update_issue**: Update an existing issue in a GitHub repository

## Filesystem Tools (filesystem)
- **create_directory**: Create a new directory or ensure a directory exists
- **get_file_info**: Retrieve detailed metadata about a file or directory
- **list_allowed_directories**: Returns the list of directories that this server is allowed to access
- **list_directory**: Get a detailed listing of all files and directories in a specified path
- **move_file**: Move or rename files and directories
- **read_file**: Read the complete contents of a file from the file system
- **search_files**: Recursively search for files and directories matching a pattern
- **write_file**: Create a new file or overwrite an existing file with new content

## Unity Tools (unityMCP)
- **apply_prefab**: Apply changes made to a prefab instance back to the original prefab asset
- **attach_script**: Attach a script component to a GameObject
- **build**: Build the project for a specified platform
- **change_scene**: Change to a different scene, optionally saving the current one
- **create_object**: Create a game object in the Unity scene
- **create_prefab**: Create a new prefab asset from a GameObject in the scene
- **create_script**: Create a new Unity script file
- **delete_object**: Remove a game object from the scene
- **execute_command**: Execute a specific editor command or custom script within the Unity editor
- **find_objects_by_name**: Find game objects in the scene by name
- **find_objects_by_tag**: Find game objects in the scene by tag
- **get_asset_list**: Get a list of assets in the project
- **get_component_properties**: Get properties of a specific component on a game object
- **get_hierarchy**: Get the current hierarchy of game objects in the scene
- **get_object_info**: Get info about a specific game object
- **get_object_properties**: Get all properties of a specified game object
- **get_scene_info**: Retrieve detailed info about the current Unity scene
- **get_selected_object**: Get the currently selected game object in the Unity Editor
- **import_asset**: Import an asset (e.g., 3D model, texture) into the Unity project
- **instantiate_prefab**: Instantiate a prefab into the current scene at a specified location
- **list_scripts**: List all script files in a specified folder
- **modify_object**: Modify a game object's properties and components
- **new_scene**: Create a new empty scene in the Unity editor
- **open_scene**: Open a specified scene in the Unity editor
- **pause**: Pause the game while in play mode
- **play**: Start the game in play mode within the Unity editor
- **redo**: Redo the last undone action in the Unity editor
- **save_scene**: Save the current scene to its file
- **select_object**: Select a game object in the Unity Editor
- **set_material**: Apply or create a material for a game object
- **stop**: Stop the game and exit play mode
- **undo**: Undo the last action performed in the Unity editor
- **update_script**: Update the contents of an existing Unity script
- **view_script**: View the contents of a Unity script file

## Web Fetch Tools (fetch)
- **fetch_html**: Fetch a website and return the content as HTML
- **fetch_json**: Fetch a JSON file from a URL
- **fetch_markdown**: Fetch a website and return the content as Markdown
- **fetch_txt**: Fetch a website, return the content as plain text (no HTML)

## Web Research Tools (webresearch)
- **search_google**: Search Google for a query
- **take_screenshot**: Take a screenshot of the current page
- **visit_page**: Visit a webpage and extract its content

## Firecrawl Tools (firecrawl)
- **firecrawl_batch_scrape**: Scrape multiple URLs in batch mode
- **firecrawl_check_batch_status**: Check the status of a batch scraping job
- **firecrawl_check_crawl_status**: Check the status of a crawl job
- **firecrawl_crawl**: Start an asynchronous crawl of multiple pages from a starting URL
- **firecrawl_extract**: Extract structured information from web pages using LLM
- **firecrawl_map**: Discover URLs from a starting point
- **firecrawl_scrape**: Scrape a single webpage with advanced options for content extraction
- **firecrawl_search**: Search and retrieve content from web pages with optional scraping

## Airtable Tools (airtable)
- **create_field**: Create a new field in a table
- **create_record**: Create a new record in a table
- **create_table**: Create a new table in a base
- **delete_records**: Delete records from a table
- **describe_table**: Get detailed information about a specific table
- **get_record**: Get a specific record by ID
- **list_bases**: List all accessible Airtable bases
- **list_records**: List records from a table
- **list_tables**: List all tables in a specific base
- **search_records**: Search for records containing specific text
- **update_field**: Update a field's name or description
- **update_records**: Update up to 10 records in a table
- **update_table**: Update a table's name or description

## Sketchfab Tools (sketchfab)
- **sample-tool**: A sample tool for demonstration purposes
- **sketchfab-download**: Download a 3D model from Sketchfab
- **sketchfab-model-details**: Get detailed information about a specific Sketchfab model
- **sketchfab-search**: Search for 3D models on Sketchfab based on keywords and filters

## Spatial Database Tools (Spatial-mcp-pinecone-database)
- **list-documents**: List all documents in the knowledge base by namespace
- **pinecone-stats**: Get stats about the Pinecone index specified in this server
- **process-document**: Process a document. This will optionally chunk, then embed, and upsert the document into pinecone
- **read-document**: Read a document from pinecone
- **semantic-search**: Search pinecone for documents

## Freepik Tools (freepik)
- **check_status**: Check the status of a Mystic image generation task
- **download_resource**: Get download URL for a specific resource
- **generate_image**: Generate an image using Freepik Mystic AI
- **search_resources**: Search for Freepik resources (photos, vectors, PSDs) with filters
- **upscale_image**: Upscale an image using Freepik's AI upscaler

## Netlify Tools (netlify-mcp)
- **add-dns-record**: Add a DNS record to a site
- **deploy-function**: Deploy a serverless function
- **deploy-site**: Deploy a site to Netlify
- **get-deploy-status**: Get deployment status for a site
- **list-sites**: List all Netlify sites
- **manage-form**: Manage form submissions
- **manage-hook**: Manage webhook notifications
- **manage-plugin**: Manage site plugins
- **set-env-vars**: Set environment variables for a site

## Cloudflare Tools (cloudflare)
- **analytics_get**: Get analytics data from Cloudflare
- **d1_create_database**: Create a new D1 database
- **d1_delete_database**: Delete a D1 database
- **d1_list_databases**: List all D1 databases in your account
- **d1_query**: Execute a SQL query against a D1 database
- **kv_delete**: Delete a key from Cloudflare KV store
- **kv_get**: Get a value from Cloudflare KV store
- **kv_list**: List keys in Cloudflare KV store
- **kv_put**: Put a value into Cloudflare KV store
- **r2_create_bucket**: Create a new R2 bucket
- **r2_delete_bucket**: Delete an R2 bucket
- **r2_delete_object**: Delete an object from an R2 bucket
- **r2_get_object**: Get an object from an R2 bucket
- **r2_list_buckets**: List all R2 buckets in your account
- **r2_list_objects**: List objects in an R2 bucket
- **r2_put_object**: Put an object into an R2 bucket
- **worker_delete**: Delete a Worker script
- **worker_get**: Get a Worker's script content
- **worker_list**: List all Workers in your account
- **worker_put**: Create or update a Worker script with optional bindings and compatibility settings

## OpenAPI Tools (openapi)
- **generate_client**: Generate a client library from an OpenAPI specification
- **make_request**: Make an API request based on an OpenAPI operation
- **parse_spec**: Parse and validate an OpenAPI specification

## YouTube Tools (youtube)
- **download_youtube_url**: Download YouTube subtitles from a URL

## UI Component Tools (21st-dev-mcp)
- **generate_component_prompt**: Generate a prompt for a specific component
- **search_components**: Search for UI components using natural language