import {IInputs, IOutputs} from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
import { runInThisContext } from "vm";
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export class NoteIt implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	/**
	 * Global Variables
	 */
	private _container: HTMLDivElement;
	private _notifyOutputChanged: () => void;
	private _context: ComponentFramework.Context<IInputs>;
	private _columnNumber: number = -1;
	private _displayColumnName: boolean = false;
	


	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		// Add control initialization code
		this._notifyOutputChanged = notifyOutputChanged;
		this._container = container;
		this._context = context;
		this._columnNumber =  this._context.parameters.columnNumberDisplayed === null ? 3 : 
								 (this._context.parameters.columnNumberDisplayed.raw === null ? 3 : this._context.parameters.columnNumberDisplayed.raw);
		this._displayColumnName =  this._context.parameters.displayColumnName === null ? false : 
							 	(this._context.parameters.displayColumnName.raw === null ? false : (this._context.parameters.displayColumnName.raw.toLowerCase() === "true" ? true : false));		
		
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
		this._context = context;

		if (!context.parameters.dataSetInstance.loading) {
			if (context.parameters.dataSetInstance.paging != null && context.parameters.dataSetInstance.paging.hasNextPage == true) {
				context.parameters.dataSetInstance.paging.setPageSize(12);
				context.parameters.dataSetInstance.paging.loadNextPage();
			}
			else {
				const dataSet = context.parameters.dataSetInstance;
				const dataItems = this._items(dataSet, dataSet.columns);


				dataItems.forEach((element) => { // foreach statement  
					var _divParentElement  = document.createElement("div");
					_divParentElement.setAttribute("class", "container");
					
					// add to main div
					// image is now preparing
					var _imgElement: HTMLImageElement;
					//image object is creating...
					_imgElement = document.createElement("img");
					_imgElement.addEventListener("click", this.onImageClick.bind(this));

					context.resources.getResource("NoteIt_300x300.png", function (data) {

						let imageUrl:string = "data:image/" + "png" + ";base64, " + data;
						_imgElement.src = imageUrl;

					}, function () {});
					

					_divParentElement.appendChild(_imgElement);

					// text is now adding
					var _divChildElement  = document.createElement("div");
					_divChildElement.setAttribute("class", "centered");

					var counter = 0;

					dataSet.columns.forEach((col) => {
						if (counter >= this._columnNumber)
							return;

						var _pElement = document.createElement("p");
						if (this._displayColumnName)
							_pElement.append(col.displayName + ":" + element[col.name]);
						else
							_pElement.append(element[col.name]);
	
						_divChildElement.append(_pElement);
						counter++;
					});

					_divParentElement.append(_divChildElement);

					// add to html
					this._container.appendChild(_divParentElement);
				}); 
			}
		}
	}

	// Get the items from the dataset
	private _items = (ds: DataSet, _columns: DataSetInterfaces.Column[]) => {
		let dataSet = ds;

		var resultSet = dataSet.sortedRecordIds.map(function (key) {
			var record = dataSet.records[key];
			var newRecord: any = {
				key: record.getRecordId()
			};
			for (var column of _columns) {
				newRecord[column.name] = record.getFormattedValue(column.name);
			}
			return newRecord;
		});

		return resultSet;
	}


	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}

	private onImageClick(event: Event): void {
		//this._notifyOutputChanged();
	}

}