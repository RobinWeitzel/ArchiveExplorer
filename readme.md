# ArchiveExplorer - GUI to search [MailArchive](https://github.com/RobinWeitzel/MailArchiver)

This is a gui to display archived emails.

### Getting Started
This is a NodeJS script meant to be run in a docker container (though it could also be run standalone with a little modification).<br>

To get started, simply type in the following command.
```
docker run -e mongourl="<your-mongodb-url>" -e mongodb="<your-mongodb-name>" --name <your-container-name> -d robinweitzel/archive-explorer
```
Fill in the variables:
* \<your-mongodb-url> : The url pointing to the mongodb server 
* \<your-mongodb-name>: The name of the database in which the emails are saved
