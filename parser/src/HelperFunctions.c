#include "HelperFunctions.h"

//Helper function to tell what the current item you are reading in is (alarm, event, ical property)
void updateState(int *event, int *alarm, char *first, char *ptr, Event **evt, Calendar **cal, Alarm **alm, ICalErrorCode *error) {
    if ((strcmp(first, "BEGIN") == 0) && (strcmp(ptr, "VEVENT") == 0)) {
        //Check if new event is being called without a closing statement
        if (*event == 1) {
            *error = INV_EVENT;
        }
        else {
          //Updates event to be true and creates memory for it, initializing values
          *evt = malloc(sizeof(Event));
          strcpy((*evt)->UID, "bananorama");
          (*evt)->startDateTime.date[0] = 0;
          (*evt)->creationDateTime.date[0] = 0;
          (*evt)->properties = initializeList((*printProperty), (*deleteProperty), (*compareProperties));
          (*evt)->alarms = initializeList((*printAlarm), (*deleteAlarm), (*compareAlarms));
          *event = 1;
        }
    }
    else if ((strcmp(first, "END") == 0) && (strcmp(ptr, "VEVENT") == 0)) {
        //Resets event
        *event = 0;
        if (strcmp((*evt)->UID, "bananorama") == 0) {
            *error = INV_EVENT;
        }
        else if ((*evt)->startDateTime.date[0] == 0) {
            *error = INV_EVENT;
        }
        else if ((*evt)->creationDateTime.date[0] == 0) {
            *error = INV_EVENT;
        }
        else {
          //Appends event to the iCal list
          insertBack((*cal)->events, *evt);
        }
    }
    else if ((strcmp(first, "BEGIN") == 0) && (strcmp(ptr, "VALARM") == 0)) {
        //Check if new alarm is being called without a closing statement
        if (*alarm == 1) {
            *error = INV_ALARM;
        }
        else {
            //Updates alarm to be true
            *alm = malloc(sizeof(Alarm));
            //So I kinda need to initialize my strings to something otherwise I'll get a mem error. These are my temp values, there is NO WAY someone will
            //have a value as this.
            strcpy((*alm)->action, "bananorama");
            (*alm)->trigger = malloc(sizeof(char) * 11);
            strcpy((*alm)->trigger, "bananorama");
            (*alm)->properties = initializeList((*printProperty), (*deleteProperty), (*compareProperties));
            *alarm = 1;
        }
    }
    else if ((strcmp(first, "END") == 0) && (strcmp(ptr, "VALARM") == 0)) {
        //Resets alarm
        *alarm = 0;
        //Error checking to see if it is a valid alarm: trigger and action must both exist
        if (strcmp((*alm)->trigger, "bananorama") == 0) {
            *error = INV_ALARM;
        }
        else if (strcmp((*alm)->action, "bananorama") == 0) {
            *error = INV_ALARM;
        }
        else {
          //Appends current alarm to the event list
          insertBack((*evt)->alarms, *alm);
        }
    }
}

//Helper function to create a new DateTime struct
void createDate(char *ptr, DateTime **dt) {
    char *time;
    //Seperates the Date from the Time
    time = strtok(ptr, "T");
    strcpy((*dt)->date, time);
    time = strtok(NULL, "");
    //Checks if UTC is true
    if (time[strlen(time) - 1] == 'Z') {
        //If it is, remove the Z from the string and set UTC to true
        (*dt)->UTC = true;
        time[strlen(time) - 1] = '\0';
    }
    else {
        (*dt)->UTC = false;
    }
    strcpy((*dt)->time, time);
}

//Helper function to add a new event
void addToEvent(char *first, char *ptr, Calendar **obj, Event **evt, ICalErrorCode *err) {
    //Adds the UID property to the struct
    if (strcmp(first, "UID") == 0) {
        if (strcmp((*evt)->UID, "bananorama") == 0) {
            strcpy((*evt)->UID, ptr);
        }
        else {
            *err = INV_EVENT;
        }
    }
    //Creates a new DateTime struct, and appends it to the startDT property
    else if (strcmp(first, "DTSTART") == 0) {
        char *time;
        char temp[strlen(ptr) + 1];
        strcpy(temp, ptr);
        //This is for error checking to see if the string is valid
        time = strtok(temp, "T");
        //The date part must be 8 characters and the time part must be either 6 or 7
        if (strlen(time) == 8) {
            time = strtok(NULL, "T");
            if ((strlen(time) == 6) || (strlen(time) == 7)) {
                //If it is a valid string, allocate memory for a new dt and add it
                DateTime *dt =  malloc(sizeof(DateTime));
                createDate(ptr, &dt);
                (*evt)->startDateTime = *dt;
                free(dt);
            }
            else {
                *err = INV_DT;
            }
        }
        else {
            *err = INV_DT;
        }
    }
    //Creates a new DateTime struct and appends it to the dateCreated property
    else if (strcmp(first, "DTSTAMP") == 0) {
      char *time;
      char temp[strlen(ptr) + 1];
      strcpy(temp, ptr);
      //This error checking is the same for DTSTART
      time = strtok(temp, "T");
      if (strlen(time) == 8) {
          time = strtok(NULL, "T");
          if ((strlen(time) == 6) || (strlen(time) == 7)) {
              //Allocate memory for a new dt and put it into the struct
              DateTime *dt =  malloc(sizeof(DateTime));
              createDate(ptr, &dt);
              (*evt)->creationDateTime = *dt;
              free(dt);
          }
          else {
              *err = INV_DT;
          }
      }
      else {
          *err = INV_DT;
      }
    }
    //Adds the rest of the properties into the misc category
    else if (strcmp(first, "BEGIN") != 0) {
        if (strcmp(first, "END") != 0) {
            //Create a new property struct, append the values and place it into the list
            Property *prop = malloc(sizeof(Property) + (strlen(ptr) + 1) * sizeof(char));
            strcpy(prop->propName, first);
            strcpy(prop->propDescr, ptr);
            //ADD TO EVENT LIST
            insertBack((*evt)->properties, prop);
        }
    }
}

//Helper function to add a property to an alarm
void addToAlarm(char *first, char *ptr, Event **evt, Alarm **alm) {
    //Adds an action
    if (strcmp(first, "ACTION") == 0) {
        strcpy((*alm)->action, ptr);
    }
    //Adds a trigger
    else if (strcmp(first, "TRIGGER") == 0) {
        free((*alm)->trigger);
        (*alm)->trigger = malloc((sizeof(char) + 1) * strlen(ptr));
        strcpy((*alm)->trigger, ptr);
    }
    //Adds any other property
    else if (strcmp(first, "BEGIN") != 0) {
        if (strcmp(first, "END") != 0) {
          Property *prop = malloc(sizeof(Property) + (strlen(ptr) + 1) * sizeof(char));
          strcpy(prop->propName, first);
          strcpy(prop->propDescr, ptr);
          //ADD TO ALARM LIST
          insertBack((*alm)->properties, prop);
        }
    }
}

//Helper function to add a property to the iCal file
void addToCal(char *first, char *ptr, Calendar **obj, ICalErrorCode *err, int *isVersion) {
    if (strcmp(first, "VERSION") == 0) {
        //Check if the version already exists
        if (*isVersion == 1) {
            *err = DUP_VER;
        }
        else {
            (*obj)->version = atof(ptr);
            *isVersion = 1;
        }
    }
    //Adds the PRODID
    else if (strcmp(first, "PRODID") == 0) {
        //Make sure that error checking doesn't occur if the line is being unfolded
        if (strlen((*obj)->prodID) != 0) {
            *err = DUP_PRODID;
        }
        else {
            strcpy((*obj)->prodID, ptr);
        }
    }
    //Adds anything that isn't begin or end as a property
    else if (strcmp(first, "BEGIN") != 0) {
        if (strcmp(first, "END") != 0) {
            Property *prop = malloc(sizeof(Property) + (strlen(ptr) + 1) * sizeof(char));
            strcpy(prop->propName, first);
            strcpy(prop->propDescr, ptr);
            //ADD TO iCAL LIST
            insertBack((*obj)->properties, prop);
        }
    }
}

char* serializeEvent(void* toBePrinted, FILE **fp) {
    Event *evt = (Event*)toBePrinted;
    char *str;
    char *tempCreateDate = printDate(&evt->creationDateTime);
    char *tempStartDate = printDate(&evt->startDateTime);
    char *tempProp = toString(evt->properties);
    str = malloc(sizeof(char) * (strlen(tempProp) + strlen(evt->UID) + 44 + strlen(tempStartDate) + strlen(tempCreateDate)));
    strcpy(str, "UID:");
    strcat(str, evt->UID);
    strcat(str, "\r\nDTSTAMP:");
    strcat(str, tempCreateDate);
    strcat(str, "\r\nDTSTART:");
    strcat(str, tempStartDate);
    strcat(str, tempProp);
    strcat(str, "\r\n");
    ListIterator iter = createIterator(evt->alarms);
    void* elem;
    while((elem = nextElement(&iter)) != NULL){
        fputs("BEGIN:VALARM\r\n", *fp);
        char* currDescr = serializeAlarm(elem);
        fputs(currDescr, *fp);
        free(currDescr);
        fputs("END:VALARM\r\n", *fp);
    }
    free(tempProp);
    free(tempStartDate);
    free(tempCreateDate);
    return str;
}

char* serializeAlarm(void* toBePrinted) {
    Alarm *alm = (Alarm*)toBePrinted;
    char *str;
    char *tempProp = toString(alm->properties);
    str = malloc(sizeof(char) * (strlen(alm->action) + strlen(alm->trigger) + strlen(tempProp) + 30));
    strcpy(str, "ACTION:");
    strcat(str, alm->action);
    strcat(str, "\r\nTRIGGER:");
    strcat(str, alm->trigger);
    strcat(str, tempProp);
    strcat(str, "\r\n");
    free(tempProp);
    return str;
}

ICalErrorCode validateDateTime(char *date) {
    char *time;
    char temp[strlen(date) + 1];
    strcpy(temp, date);
    //This is for error checking to see if the string is valid
    time = strtok(temp, "T");
    //The date part must be 8 characters and the time part must be either 6 or 7
    if (strlen(time) == 8) {
        time = strtok(NULL, "T");
        if ((strlen(time) < 6) || (strlen(time) > 7)) {
            return INV_EVENT;
        }
    }
    else {
        return INV_EVENT;
    }
    return OK;
}

ICalErrorCode validateDateTimeStruct(DateTime dt) {
    if (strlen(dt.date) != 8) {
        return INV_EVENT;
    }
    if (strlen(dt.time) != 6) {
        return INV_EVENT;
    }
    return OK;
}

int validateProperty(Property *prop) {
    if ((strlen(prop->propName) >= 200) || (strlen(prop->propName) < 1)) {
        return 0;
    }
    if (strlen(prop->propDescr) < 1) {
        return 0;
    }
    return 1;
}

ICalErrorCode validateEvent(void *toBeValidated) {
    Event *evt = (Event*)toBeValidated;
    //0-13 required only one, 14-23 anytime
    char *propList[27] = {"CLASS", "CREATED", "DESCRIPTION", "GEO", "LAST-MODIFIED", "LOCATION", "ORGANIZER", "PRIORITY", "SEQUENCE", "STATUS", "SUMMARY", "TRANSP", "URL", "RECURRENCE-ID", "DTEND", "DURATION", "ATTACH", "ATTENDEE", "CATEGORIES", "COMMENT", "CONTACT", "EXDATE", "RSTATUS", "RELATED", "RESOURCES", "RDATE", "RRULE"};
    //Array that keeps track of number of times an item occurs
    int inArray[16] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
    int isValid = 0;
    int i = 0;
    ICalErrorCode err;
    err = OK;
    //Perform struct validation
    //Check if UID  is valid
    if ((strlen(evt->UID) >= 1000) || (strlen(evt->UID) < 1)) {
        return INV_EVENT;
    }

    //Validate DTSTART and DTSTAMP
    if ((validateDateTimeStruct(evt->creationDateTime) != OK) || (validateDateTimeStruct(evt->startDateTime) != OK)) {
        return INV_EVENT;
    }

    if (evt->properties == NULL) {
        return INV_EVENT;
    }

    if (evt->alarms == NULL) {
        return INV_EVENT;
    }

    //perform event property validation
    ListIterator iter = createIterator(evt->properties);
    void* elem;
    while((elem = nextElement(&iter)) != NULL){
        isValid = 0;
        Property *prop = (Property*)elem;

        //Validate property struct
        if (validateProperty(prop) == 0) {
            return INV_EVENT;
        }

        for (i = 0; i < 27; ++i) {
            //Check if the property is valid
            if (strcmp(prop->propName, propList[i]) == 0) {
                //Increment the number of times the property occurs
                if (i < 14) {
                    inArray[i] = inArray[i] + 1;
                    if (inArray[i] >= 2) {
                        return INV_EVENT;
                    }
                }
                if ((i == 14) || (i == 15)) {
                    inArray[i] = inArray[i] + 1;
                }
                //Makes sure that optional events that can only occur once stays true
                isValid = 1;
            }
        }
        //Check if both DTEND and DURATION occur
        if ((inArray[14] > 0) && (inArray[15] > 0)) {
            return INV_EVENT;
        }
        //Check if neither DTEND and DURATION occur (because DTSTART is mandatory, one of these must happen)
        //if ((inArray[14] == 0) && (inArray[15] == 0)) {
        //    return INV_EVENT;
        //}
        //checks to see if the property is supposed to be in an event
        if (isValid == 0) {
            return INV_EVENT;
        }
        /*
        Begin checking misc. Properties
        */
        //Check if DTEND is a valid datetime
        /*if (strcmp(prop->propName, "DTEND") == 0) {
            err = validateDateTime(prop->propDescr);
            if (err != OK) {
                return err;
            }
        }
        //Check transparency valid properties
        if (strcmp(prop->propName, "TRANSP") == 0) {
            if ((strcmp(prop->propDescr, "TRANSPARENT") != 0) && (strcmp(prop->propDescr, "OPAQUE") != 0)) {
                return INV_EVENT;
            }
        }

        //Check CLASS property values
        if (strcmp(prop->propName, "CLASS") == 0) {
            if ((strcmp(prop->propDescr, "PUBLIC") != 0) && (strcmp(prop->propDescr, "PRIVATE") != 0) && (strcmp(prop->propDescr, "CONFIDENTIAL") != 0)) {
                return INV_EVENT;
            }
        }
        if (strcmp(prop->propName, "CREATED") == 0) {
            err = validateDateTime(prop->propDescr);
            if (err != OK) {
                return err;
            }
        }
        if (strcmp(prop->propName, "LAST-MODIFIED") == 0) {
            err = validateDateTime(prop->propDescr);
            if (err != OK) {
                return err;
            }
        }
        if (strcmp(prop->propName, "STATUS") == 0) {
            if ((strcmp(prop->propDescr, "TENTATIVE") != 0) && (strcmp(prop->propDescr, "CONFIRMED") != 0) && (strcmp(prop->propDescr, "CANCELLED") != 0)) {
                return INV_EVENT;
            }
        }
        if (strcmp(prop->propName, "PRIORITY") == 0) {
            //Check if the value is a string
            err = isInt(prop->propDescr, INV_EVENT);
            if (err != OK) {
                return err;
            }
            //Check if it is between 0 and 9
            if ((atoi(prop->propDescr) < 0) || (atoi(prop->propDescr) > 9)) {
                return INV_EVENT;
            }
        }
        //Increases by 1 every revision
        if (strcmp(prop->propName, "SEQUENCE") == 0) {
            err = isInt(prop->propDescr, INV_EVENT);
            if (err != OK) {
                return err;
            }
        }*/
    }

    //Iterate through the list of Alarms and validate each one
    ListIterator iter1 = createIterator(evt->alarms);
    void* elem1;
    while((elem1 = nextElement(&iter1)) != NULL){
        err = validateAlarm(elem1);
        //Check if an error occurred when iterating through the alarms
        if (err != OK) {
            return err;
        }
    }
    return err;
}

ICalErrorCode isInt(char *word, ICalErrorCode err) {
    int i;
    for (i = 0; i < strlen(word); ++i) {
        if ((word[i] > '9') || (word[i]< '0')) {
            return err;
        }
    }
    return OK;
}

ICalErrorCode validateAlarm(void *toBeValidated) {
    Alarm *alm = (Alarm*)toBeValidated;
    int durationCount = 0;
    int repeatCount = 0;
    int attachCount = 0;
    ICalErrorCode err;
    //check required Properties
    //Alarm struct validation
    //Validate action
    if ((strlen(alm->action) >= 200) || (strlen(alm->action) < 1)) {
        return INV_ALARM;
    }
    if (alm->trigger == NULL) {
        return INV_ALARM;
    }
    if (strlen(alm->trigger) < 1) {
      return INV_ALARM;
    }
    if (alm->properties == NULL) {
        return INV_ALARM;
    }
    //Performs Alarm validation on list of properties
    ListIterator iter = createIterator(alm->properties);
    void* elem;
    while((elem = nextElement(&iter)) != NULL){
        Property *prop = (Property*)elem;

        //Validate property struct
        if (validateProperty(prop) == 0) {
            return INV_ALARM;
        }

        if (strcmp(prop->propName, "DURATION") == 0) {
            durationCount++;
        }
        else if (strcmp(prop->propName, "REPEAT") == 0) {
            //Repeat must be an integer value
            err = isInt(prop->propDescr, INV_ALARM);
            if (err != OK) {
                return err;
            }
            repeatCount++;
        }
        else if (strcmp(prop->propName, "ATTACH") == 0) {
            attachCount++;
        }
        else {
            return INV_ALARM;
        }
        //Duration and repeat cannot occur more than once
        if ((durationCount > 1) || (repeatCount > 1) || (attachCount > 1)) {
            return INV_ALARM;
        }
    }
    //If duration occurs, then repeat must occur. Vice versa
    if (((durationCount == 1) && (repeatCount == 0)) || ((durationCount == 0) && (repeatCount == 1))) {
        return INV_ALARM;
    }
    return OK;
}
